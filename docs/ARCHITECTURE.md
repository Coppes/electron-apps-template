# Architecture Documentation

## Overview

This Electron application follows a modular, security-first architecture with clear separation between main and renderer processes. The design emphasizes maintainability, testability, and security best practices.

## Directory Structure

```
src/
├── main/                    # Main process code
│   ├── config.js           # Environment configuration
│   ├── crash-reporter.js   # Crash reporting setup
│   ├── dev-tools.js        # Development tools integration
│   ├── error-handler.js    # Global error handling
│   ├── lifecycle.js        # Application lifecycle management
│   ├── logger.js           # Enhanced logging system
│   ├── menu.js             # Application menu
│   ├── updater.js          # Auto-update functionality
│   ├── window-manager.js   # Window lifecycle management
│   ├── ipc/                # IPC communication layer
│   │   ├── bridge.js       # IPC validation and routing
│   │   ├── schema.js       # Type schemas for IPC
│   │   └── handlers/       # IPC handler implementations
│   └── security/           # Security modules
│       ├── audit-log.js    # Security event logging
│       ├── context-isolation.js
│       ├── csp.js          # Content Security Policy
│       ├── navigation-guard.js
│       └── permissions.js  # Permission management
├── renderer/               # Renderer process code
│   ├── App.jsx            # Main React component
│   ├── index.js           # Renderer entry point
│   ├── index.html         # HTML template
│   ├── components/        # React components
│   └── utils/             # Utility functions
├── common/                # Shared code
│   ├── constants.js       # Shared constants
│   └── types.js           # JSDoc type definitions
├── css/                   # Global styles
└── preload.js            # Preload script (bridge)
```

## Core Modules

### 1. Lifecycle Manager (`lifecycle.js`)

**Responsibility**: Orchestrates application startup, shutdown, and lifecycle events.

**Key Features**:
- Ordered initialization sequence
- Graceful shutdown with cleanup
- Single instance lock management
- Crash recovery detection
- Deep linking support

**Initialization Order**:
1. Load environment configuration
2. Check for crash markers
3. Create new crash marker
4. Register IPC handlers
5. Setup application menu
6. Create main window
7. Remove crash marker (successful startup)

**Dependencies**: Window Manager, Logger, IPC Bridge, Menu

### 2. Window Manager (`window-manager.js`)

**Responsibility**: Manages window creation, state persistence, and lifecycle.

**Key Features**:
- Multi-window support with unique IDs
- State persistence (position, size, maximized state)
- Window bounds validation
- Window type templates (main, settings, about)
- Event-driven window tracking

**State Persistence**:
- Uses electron-store for automatic state saving
- Saves on window close or bounds change
- Restores on window creation
- Validates bounds to ensure windows are visible

**Dependencies**: electron-store, Logger

### 3. IPC Bridge (`ipc/bridge.js`)

**Responsibility**: Provides type-safe, validated IPC communication.

**Key Features**:
- Schema-based validation (input and output)
- Automatic error handling
- Request/response pattern
- Comprehensive logging

**Validation Flow**:
1. Receive IPC call from renderer
2. Validate input against schema
3. Execute handler if validation passes
4. Validate output against schema
5. Return result or error to renderer

**Schema Format**:
```javascript
{
  [channel]: {
    input: {
      field: { type: 'string', required: true }
    },
    output: {
      result: { type: 'boolean', required: true }
    }
  }
}
```

**Dependencies**: ipcMain, Logger, Handler modules

### 4. Security Layer (`security/`)

**Responsibility**: Multi-layer security implementation.

**Components**:

#### CSP (Content Security Policy)
- Restricts resource loading
- Blocks inline scripts (except Tailwind styles)
- Whitelists trusted origins
- Development mode exceptions for localhost

#### Navigation Guard
- Intercepts navigation attempts
- Validates URLs against allowlist
- Prevents phishing and unauthorized access
- Logs security events

#### Permission Management
- Handles device permission requests
- User consent dialogs
- Permission deny/allow based on policy
- Audit logging for all permission events

#### Context Isolation
- Enforces separation between main and renderer
- Prevents renderer compromise from affecting main
- Secure preload script patterns

**Security Principles**:
- Defense in depth (multiple layers)
- Fail-safe defaults (deny by default)
- Audit all security events
- Minimal privilege principle

### 5. Logger (`logger.js`)

**Responsibility**: Structured logging with levels and persistence.

**Features**:
- Multiple log levels (debug, info, warn, error)
- File output with rotation
- Console transport for development
- Contextual metadata support
- Performance-friendly

**Log Locations**:
- **Development**: Console + File
- **Production**: File only
- **File Path**: `{userData}/logs/main.log`

**Usage**:
```javascript
logger.info('Message', { context: 'data' });
logger.error('Error occurred', error);
```

### 6. Configuration (`config.js`)

**Responsibility**: Environment-based configuration management.

**Features**:
- Environment detection (development/production/test)
- Environment variable overrides
- Defaults for all settings
- Type-safe configuration access

**Configuration Sections**:
- `env`: Current environment
- `isDevelopment`: Boolean flag
- `isProduction`: Boolean flag
- `singleInstance.enabled`: Single instance mode
- `window`: Default window settings
- `security`: Security policies
- `update`: Auto-update settings
- `logging`: Log configuration

## Process Communication

### Main → Renderer

**Event-based communication** for push notifications:

```javascript
// Main process
mainWindow.webContents.send('update:available', { version: '1.1.0' });

// Renderer process
window.electronAPI.onUpdateAvailable((info) => {
  console.log('Update available:', info);
});
```

### Renderer → Main

**Request/Response pattern** via IPC handlers:

```javascript
// Renderer
const result = await window.electronAPI.window.create('settings');

// Main (handled by IPC Bridge)
ipcMain.handle('window:create', async (event, type, options) => {
  return windowManager.createWindow(type, options);
});
```

### Security Boundaries

```
┌──────────────────────────────────────┐
│         Renderer Process             │
│  (Sandboxed, No Node Integration)    │
│                                      │
│  • React Application                 │
│  • Limited API via window.electronAPI│
└──────────────┬───────────────────────┘
               │
               │ contextBridge
               │
┌──────────────▼───────────────────────┐
│         Preload Script               │
│  (Has Node.js access, isolated)      │
│                                      │
│  • Exposes safe API                  │
│  • Validates and sanitizes inputs    │
└──────────────┬───────────────────────┘
               │
               │ IPC
               │
┌──────────────▼───────────────────────┐
│         Main Process                 │
│  (Full Node.js and Electron access)  │
│                                      │
│  • IPC Bridge (validation)           │
│  • Window Manager                    │
│  • Security Layer                    │
│  • File System Access                │
└──────────────────────────────────────┘
```

## Error Handling

### Main Process Errors

**Global Handlers**:
- `process.on('uncaughtException')`: Catches unhandled exceptions
- `process.on('unhandledRejection')`: Catches unhandled promise rejections

**Error Recovery**:
1. Log error with full context
2. Show user-friendly error dialog
3. Attempt graceful recovery
4. Create crash marker if fatal

### Renderer Process Errors

**React Error Boundaries**:
- `ErrorBoundary` component wraps app
- Catches React rendering errors
- Shows fallback UI
- Logs error to main process

**Window Error Handler**:
- `window.onerror`: Catches global JS errors
- Reports to main process for logging
- Prevents white screen of death

## Testing Architecture

### Unit Tests
- **Scope**: Individual modules in isolation
- **Location**: `test/unit/`
- **Mock**: External dependencies (electron, fs, etc.)
- **Examples**: Window Manager, Logger, IPC Bridge

### Integration Tests
- **Scope**: Module interactions
- **Location**: `test/integration/`
- **Mock**: Electron APIs only
- **Examples**: Lifecycle, IPC end-to-end

### E2E Tests
- **Scope**: Full application flow
- **Tools**: Spectron or Playwright
- **Examples**: Window creation → IPC → Data persistence

### Test Utilities
- **Fixtures**: `test/fixtures/` - Reusable test data
- **Mocks**: `test/setup/` - Electron mocks
- **Helpers**: Common test utilities

## Performance Considerations

### Startup Optimization
1. Lazy load non-critical modules
2. Parallel initialization where possible
3. Measure and log startup time
4. Cache expensive computations

### IPC Performance
- Minimize data transfer size
- Batch related operations
- Use efficient serialization
- Monitor IPC timing in development

### Memory Management
- Clean up event listeners
- Close unused windows promptly
- Clear caches periodically
- Monitor memory usage

### Window Rendering
- Use `show: false` + `ready-to-show` event
- Minimize initial bundle size
- Lazy load routes/components
- Optimize React rendering

## Security Best Practices

### Implementation Checklist
- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Sandbox enabled
- ✅ Content Security Policy configured
- ✅ Navigation guards active
- ✅ Permission management in place
- ✅ External link handling secured
- ✅ IPC input validation
- ✅ Security audit logging
- ✅ No eval() or new Function()

### Regular Security Audits
- Review electron-builder configuration
- Check CSP effectiveness
- Audit IPC channels
- Validate permission policies
- Review navigation allowlists
- Update dependencies regularly

## Build & Distribution

### Build Process
1. `electron-vite build`: Compiles React + main process
2. `electron-builder`: Packages application
3. Code signing (macOS/Windows)
4. Notarization (macOS)
5. Auto-update configuration

### Platform-Specific Considerations

**macOS**:
- App sandbox entitlements
- Hardened runtime
- Notarization required for distribution
- DMG + ZIP distribution

**Windows**:
- Code signing certificate
- NSIS installer configuration
- Auto-update via Squirrel
- EXE distribution

**Linux**:
- AppImage (self-contained)
- deb packages (Debian/Ubuntu)
- rpm packages (Fedora/RHEL)
- Snap/Flatpak support

## Extension Points

### Adding New IPC Handlers
1. Define schema in `src/main/ipc/schema.js`
2. Create handler in `src/main/ipc/handlers/`
3. Register in lifecycle `registerIPC()`
4. Expose in `src/preload.js`
5. Document in API.md

### Adding New Windows
1. Add type to `WINDOW_TYPES` in constants
2. Add config to `DEFAULT_WINDOW_CONFIG`
3. Create HTML/React route for window content
4. Use WindowManager to create window

### Adding Security Rules
1. Update CSP policy in `security/csp.js`
2. Add navigation rules in `security/navigation-guard.js`
3. Update permission policies in `security/permissions.js`
4. Test with security audit enabled

## Troubleshooting

### Common Issues

**Windows not restoring position**:
- Check electron-store permissions
- Verify bounds validation logic
- Review logs for save/restore errors

**IPC validation errors**:
- Check schema matches handler signature
- Verify input/output types
- Review validation error messages

**Security policy blocking resources**:
- Review CSP configuration
- Check navigation guard allowlist
- Inspect security audit logs

**Performance degradation**:
- Profile IPC call frequency
- Check memory usage
- Review event listener cleanup
- Monitor startup time metrics

## Future Enhancements

- [ ] Plugin system for extensibility
- [ ] Advanced window management (tabs, workspaces)
- [ ] Enhanced crash reporting (Sentry integration)
- [ ] Internationalization (i18n) framework
- [ ] Advanced auto-update UI
- [ ] System-native UI components
- [ ] Database integration patterns
- [ ] Background task management
