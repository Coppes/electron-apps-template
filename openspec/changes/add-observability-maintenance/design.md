# Design: Observability and Maintenance Architecture

## Overview
This design document details the technical architecture for completing observability and maintenance features in the Electron application. It builds upon existing scaffolding (`updater.js`, `logger.js`, `error-handler.js`) and adds production-ready monitoring capabilities.

## Key Architectural Decisions

### 1. Auto-Updater Event Flow

**Decision**: Use IPC event emission from main to renderer for update notifications, with UI components listening via preload API.

**Rationale**:
- Keeps UI logic in renderer, business logic in main (separation of concerns)
- Existing `IPC_CHANNELS.UPDATE_AVAILABLE` and `UPDATE_DOWNLOADED` already defined
- Non-blocking: UI can display notifications without blocking main process
- Follows existing patterns in the codebase (window events, counter updates)

**Implementation Pattern**:
```javascript
// main/updater.js - Already scaffolded, completing TODOs
this.autoUpdater.on('update-available', (info) => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach(win => {
    win.webContents.send(IPC_CHANNELS.UPDATE_AVAILABLE, {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    });
  });
});

// renderer/App.jsx - New update notification listener
useEffect(() => {
  const cleanup = window.electronAPI.events.onUpdateAvailable((info) => {
    setUpdateInfo(info);
    setShowUpdateNotification(true);
  });
  return cleanup;
}, []);
```

**Alternatives Considered**:
- ❌ Polling from renderer: Inefficient, adds unnecessary IPC calls
- ❌ Direct main process dialogs: Blocks user workflow, not modern UX
- ✅ Event-driven notifications: Clean, scalable, follows Electron best practices

### 2. Unified Logging Architecture

**Decision**: Extend preload API with log methods that forward to main process via IPC, writing to the same electron-log instance.

**Rationale**:
- Single source of truth: All logs in one file (`logs/main.log`)
- Maintains security: No direct file system access from renderer
- Structured metadata: Can tag logs with process type, window ID, component name
- Existing `logger.js` already uses `electron-log` with proper configuration

**Implementation Pattern**:
```javascript
// preload.js - Add log API
const logAPI = {
  debug: (message, meta) => ipcRenderer.invoke(IPC_CHANNELS.LOG_DEBUG, { message, meta }),
  info: (message, meta) => ipcRenderer.invoke(IPC_CHANNELS.LOG_INFO, { message, meta }),
  warn: (message, meta) => ipcRenderer.invoke(IPC_CHANNELS.LOG_WARN, { message, meta }),
  error: (message, meta) => ipcRenderer.invoke(IPC_CHANNELS.LOG_ERROR, { message, meta }),
};

// main/ipc/handlers/log.js - New handler
export function registerLogHandlers() {
  ipcMain.handle(IPC_CHANNELS.LOG_INFO, async (event, { message, meta }) => {
    const windowId = BrowserWindow.fromWebContents(event.sender)?.id;
    logger.info(`[Renderer:${windowId}] ${message}`, meta);
    return { success: true };
  });
  // ... similar for debug, warn, error
}
```

**Considerations**:
- Performance: Batch logs if high volume (future optimization)
- Security: Validate message length to prevent log spam attacks
- Privacy: Allow disabling renderer logs via config for sensitive data

### 3. Crash Reporting Strategy

**Decision**: Optional Sentry integration with configuration flag, capturing both main and renderer crashes with full context.

**Rationale**:
- Sentry provides Electron SDK with minimal setup
- Privacy-first: Disabled by default, opt-in via config
- Rich context: Captures breadcrumbs, device info, release versions
- Existing `error-handler.js` already collects diagnostics (getDiagnostics)

**Implementation Pattern**:
```javascript
// main/crash-reporter.js - New module
import * as Sentry from '@sentry/electron';
import { config } from './config.js';

export function initializeCrashReporting() {
  if (!config.crashReporting.enabled) {
    logger.info('Crash reporting disabled');
    return;
  }

  Sentry.init({
    dsn: config.crashReporting.dsn,
    environment: config.env,
    release: `${config.app.name}@${config.app.version}`,
    beforeSend(event) {
      // Strip sensitive data
      return sanitizeEvent(event);
    }
  });

  logger.info('Crash reporting initialized', {
    environment: config.env,
    release: config.app.version
  });
}

// Integration with existing error-handler.js
export function reportError(error, context = {}) {
  logger.error('Reporting error to crash service', { error, context });
  
  if (config.crashReporting.enabled) {
    Sentry.captureException(error, {
      contexts: { custom: context },
      tags: { process: 'main' }
    });
  }
}
```

**Configuration**:
```javascript
// config.js additions
crashReporting: {
  enabled: false, // Opt-in
  dsn: process.env.SENTRY_DSN || '', // From environment
  sampleRate: 1.0,
  attachScreenshot: false, // Privacy
  attachStacktrace: true,
}
```

**Alternatives Considered**:
- ❌ Custom crash service: Too much infrastructure overhead
- ❌ File-based crash dumps: Hard to aggregate and analyze
- ✅ Sentry: Industry standard, great DX, privacy controls

### 4. Update Notification UI

**Decision**: Create reusable `UpdateNotification.jsx` component using shadcn Alert, managed by top-level App state.

**Rationale**:
- Consistent with existing UI patterns (shadcn/ui components)
- Non-intrusive: Alert banner instead of blocking modal
- User control: Allow dismiss, view changelog, or install
- State management: Simple React state in App, no global store needed

**Component Structure**:
```jsx
// renderer/components/UpdateNotification.jsx
import { Alert, AlertTitle, AlertDescription } from './ui/Alert';
import { Button } from './ui/Button';

export function UpdateNotification({ updateInfo, onInstall, onDismiss }) {
  return (
    <Alert variant="info" className="fixed top-4 right-4 w-96 shadow-lg">
      <AlertTitle>Update Available</AlertTitle>
      <AlertDescription>
        Version {updateInfo.version} is ready to install.
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={onInstall}>Install & Restart</Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>Later</Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

**UX Flow**:
1. Update detected → Show "Downloading..." banner
2. Download complete → Show "Ready to install" with actions
3. User clicks "Install" → Call `app.relaunch()` and `app.quit()`
4. User clicks "Later" → Hide banner, show again on next launch
5. Auto-install on quit (if `autoInstallOnAppQuit: true`)

## Security Considerations

### Crash Reporting Privacy
- **Sanitize events**: Strip file paths, user data, API keys before sending
- **User consent**: Require explicit opt-in, provide toggle in settings
- **Data retention**: Configure short retention periods (30 days)
- **Local-first**: Always log locally, crash reporting is supplementary

### Logging Security
- **Rate limiting**: Prevent renderer from flooding logs (DOS attack)
- **Input validation**: Sanitize log messages to prevent injection
- **Size limits**: Cap individual log messages (e.g., 10KB max)
- **Sensitive data**: Never log passwords, tokens, or PII

### Auto-Update Security
- **Code signing**: Require signed updates (already enforced by electron-updater)
- **HTTPS only**: Updates must use secure transport
- **Rollback safety**: Keep previous version for quick rollback
- **User control**: Allow disabling auto-updates via config

## File Structure

```
src/
├── main/
│   ├── updater.js              # Complete TODOs for notifications
│   ├── logger.js               # Already complete, no changes
│   ├── error-handler.js        # Add crash reporting hooks
│   ├── crash-reporter.js       # NEW: Sentry initialization
│   └── ipc/
│       └── handlers/
│           └── log.js          # NEW: Renderer log IPC handlers
├── renderer/
│   ├── App.jsx                 # Add update notification state
│   └── components/
│       └── UpdateNotification.jsx  # NEW: Update alert component
├── preload.js                  # Add log API
└── common/
    └── constants.js            # Add LOG_ IPC channels
```

## Testing Strategy

### Manual Testing
- **Auto-Updater**: Mock GitHub releases, test update flow end-to-end
- **Logging**: Verify renderer logs appear in `logs/main.log` with correct tags
- **Crash Reporting**: Trigger intentional crashes (dev only), verify Sentry captures

### Automated Testing
- **Unit tests**: Logger API formatting, crash reporter sanitization
- **Integration tests**: IPC log handlers, update event emission
- **E2E tests**: Update notification appears when event fires

### Validation
- Check log file contains entries from both main and renderer
- Verify update notification shows correct version info
- Confirm crash reports include diagnostics (platform, version)
- Test with crash reporting disabled (privacy mode)

## Dependencies

### Required
- `electron-updater@^6.6.2` (already installed)
- `electron-log@^5.4.3` (already installed)
- shadcn/ui Alert, Button components (already available)

### Optional
- `@sentry/electron@^5.0.0` - For crash reporting (configurable)

## Migration Path

1. **Phase 1**: Complete auto-updater notifications (no breaking changes)
2. **Phase 2**: Add renderer logging API (backward compatible)
3. **Phase 3**: Add crash reporting (opt-in, disabled by default)
4. **Phase 4**: Add update notification UI (graceful fallback if component missing)

All phases maintain backward compatibility with existing code.
