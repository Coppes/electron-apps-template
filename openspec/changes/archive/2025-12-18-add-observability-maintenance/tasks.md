# Tasks: Add Observability and Maintenance Features

Ordered implementation checklist for completing auto-updater, unified logging, and crash reporting.

## 1. Setup and Dependencies

- [x] Install optional dependency: `@sentry/electron@^5.0.0` (or mark as optional in package.json)
- [x] Add IPC channel constants to `src/common/constants.js`:
  - `LOG_DEBUG: 'log:debug'`
  - `LOG_INFO: 'log:info'`
  - `LOG_WARN: 'log:warn'`
  - `LOG_ERROR: 'log:error'`
  - `UPDATE_PROGRESS: 'update:progress'` (already exists: UPDATE_ERROR)
- [x] Add crash reporting config section to `src/main/config.js`
- [x] Document environment variables in `.env.example`: `SENTRY_DSN`

## 2. Renderer Logging API (Preload)

- [x] Create `src/main/ipc/handlers/log.js` IPC handler file
- [x] Implement `handleLogDebug()` - forwards to logger.debug with [Renderer:id] tag
- [x] Implement `handleLogInfo()` - forwards to logger.info with [Renderer:id] tag
- [x] Implement `handleLogWarn()` - forwards to logger.warn with [Renderer:id] tag
- [x] Implement `handleLogError()` - forwards to logger.error with [Renderer:id] tag
- [x] Add validation: message length < 10KB, message is string
- [x] Extract window ID from `BrowserWindow.fromWebContents(event.sender)`
- [x] Register all log handlers in `src/main/ipc/bridge.js`
- [x] Add `log` API namespace to `src/preload.js`:
  ```javascript
  const logAPI = {
    debug: (message, meta) => ipcRenderer.invoke(IPC_CHANNELS.LOG_DEBUG, { message, meta }),
    info: (message, meta) => ipcRenderer.invoke(IPC_CHANNELS.LOG_INFO, { message, meta }),
    warn: (message, meta) => ipcRenderer.invoke(IPC_CHANNELS.LOG_WARN, { message, meta }),
    error: (message, meta) => ipcRenderer.invoke(IPC_CHANNELS.LOG_ERROR, { message, meta }),
  };
  ```
- [x] Expose `log` API in `electronAPI` object
- [x] Freeze `logAPI` to prevent tampering
- [x] Test: Call `window.electronAPI.log.info()` from renderer, verify in `logs/main.log`

## 3. Auto-Updater Notifications (Complete TODOs)

- [x] Open `src/main/updater.js` and locate TODO comments
- [x] In `update-available` handler: Send IPC to all windows via `BrowserWindow.getAllWindows()`
  ```javascript
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach(win => {
    win.webContents.send(IPC_CHANNELS.UPDATE_AVAILABLE, {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    });
  });
  ```
- [x] In `update-downloaded` handler: Send IPC to all windows
- [x] In `download-progress` handler: Send progress IPC (throttled to max 1/sec)
- [x] In `error` handler: Send error IPC to all windows
- [x] Add `checkForUpdates()` IPC handler in `src/main/ipc/handlers/app.js`
- [x] Add `installUpdate()` IPC handler that calls `updater.quitAndInstall()`
- [x] Expose methods in preload: `app.checkForUpdates()`, `app.installUpdate()`
- [x] Test: Mock update server, verify IPC events fire

## 4. Update Notification UI Component

- [x] Create `src/renderer/components/UpdateNotification.jsx`
- [x] Import Alert, AlertTitle, AlertDescription from `./ui/Alert`
- [x] Create component props: `{ updateInfo, onInstall, onDismiss, status }`
- [x] Implement "Update Available" state (status: 'available')
- [x] Implement "Downloading..." state with progress bar (status: 'downloading')
- [x] Implement "Ready to Install" state (status: 'ready')
- [x] Add action buttons: "Install & Restart", "Later"
- [x] Style as fixed position banner (top-right corner)
- [x] Add unit tests with Testing Library
- [x] Document component props with JSDoc

## 5. Integrate Update Notifications in App

- [x] Open `src/renderer/App.jsx`
- [x] Add state: `const [updateInfo, setUpdateInfo] = useState(null)`
- [x] Add state: `const [updateStatus, setUpdateStatus] = useState(null)`
- [x] Add useEffect to listen for `onUpdateAvailable`:
  ```javascript
  useEffect(() => {
    const cleanup = window.electronAPI.events.onUpdateAvailable((info) => {
      setUpdateInfo(info);
      setUpdateStatus('available');
    });
    return cleanup;
  }, []);
  ```
- [x] Add useEffect to listen for `onUpdateDownloaded`
- [x] Implement `handleInstall()` - calls `window.electronAPI.app.installUpdate()`
- [x] Implement `handleDismiss()` - sets `updateStatus` to null
- [x] Render `<UpdateNotification>` conditionally when updateStatus is not null
- [x] Test: Trigger update event, verify banner appears

## 6. Crash Reporting Infrastructure

- [x] Create `src/main/crash-reporter.js` module
- [x] Implement `initializeCrashReporting()`:
  - Check `config.crashReporting.enabled`
  - Initialize Sentry with DSN, environment, release
  - Set up `beforeSend` hook for sanitization
  - Log initialization status
- [x] Implement `reportError(error, context = {})`:
  - Log error locally always
  - Conditionally send to Sentry if enabled
  - Add custom context to report
- [x] Implement `sanitizeEvent(event)`:
  - Strip absolute file paths (replace with [user])
  - Redact environment variables matching `*_SECRET`, `*_KEY`, `*_TOKEN`
  - Remove PII from breadcrumbs
- [x] Implement `addBreadcrumb(breadcrumb)` helper
- [x] Export functions: `initializeCrashReporting`, `reportError`, `addBreadcrumb`
- [x] Document privacy considerations in JSDoc

## 7. Integrate Crash Reporting

- [x] Open `src/main/error-handler.js`
- [x] Import `{ reportError }` from `./crash-reporter.js`
- [x] In `uncaughtException` handler: Call `reportError(error, { type: 'uncaughtException' })`
- [x] In `unhandledRejection` handler: Call `reportError(reason, { type: 'unhandledRejection' })`
- [x] In `handleRendererCrash()`: Call `reportError()` with renderer context
- [x] Open `src/main.js`
- [x] Import `{ initializeCrashReporting }` from `./main/crash-reporter.js`
- [x] Call `initializeCrashReporting()` in startup sequence (before window creation)
- [x] Test: Trigger JavaScript error in renderer, verify report

## 9. Configuration and Privacy

- [x] Update `src/main/config.js` with complete crash reporting section:
  ```javascript
  crashReporting: {
    enabled: false, // Opt-in by default
    dsn: process.env.SENTRY_DSN || '',
    environment: getEnvironment(),
    sampleRate: 1.0,
    attachScreenshot: false,
    attachStacktrace: true,
    beforeSend: null, // Set in crash-reporter.js
  }
  ```
- [x] Document privacy considerations in `SECURITY.md`
- [x] Add settings UI toggle for crash reporting (future enhancement note)
- [x] Create `.env.example` with SENTRY_DSN placeholder

## 10. Testing and Validation

- [x] Test renderer logging: Log from multiple windows, verify window IDs
- [x] Test log rotation: Fill log file beyond 10MB, verify rotation
- [x] Test rate limiting: Send 200 logs rapidly, verify throttling
- [x] Test update flow: available → download → ready → install
- [x] Test update notifications: Verify UI appears and actions work
- [x] Test crash reporting: Trigger crashes, verify Sentry dashboard
- [x] Test sanitization: Verify file paths and env vars redacted
- [x] Test disabled crash reporting: Verify no network calls
- [x] Test cross-platform: Verify logging and updates on macOS, Windows, Linux
- [x] Manual test: Check `logs/main.log` contains both main and renderer entries

## 11. Documentation

- [x] Add JSDoc to all new functions and methods
- [x] Update README.md with logging API usage examples
- [x] Document auto-updater configuration in GETTING_STARTED.md
- [x] Document crash reporting setup and privacy in SECURITY.md
- [x] Add inline comments for complex logic (sanitization, rate limiting)
- [x] Create example `.env` file with SENTRY_DSN
- [x] Document update notification UX in DEVELOPMENT.md

## 12. Code Review and Cleanup

- [x] Review all new code for security issues (input validation, sanitization)
- [x] Verify no TODOs remain in updater.js
- [x] Ensure all IPC handlers are registered in bridge.js
- [x] Check for memory leaks (event listener cleanup in React)
- [x] Verify error handling in all async functions
- [x] Run ESLint on all modified files
- [x] Format code with Prettier
- [x] Remove any debug console.logs

## Dependencies

- **Task 1** must complete before all others (dependencies and constants)
- **Task 2** must complete before Task 10 (logging tests)
- **Task 3** must complete before Task 4 (UI needs IPC events)
- **Task 4** must complete before Task 5 (App integrates component)
- **Task 6** must complete before Task 7 (integration needs infrastructure)
- **Task 7** must complete before Task 8 (main crash reporting before renderer)
- **Task 9** can proceed in parallel with other tasks (configuration)
- **Task 10** must be last (validation after implementation)
- **Task 11** must be last (documentation after implementation)
- **Task 12** must be last (cleanup after completion)

## Parallel Work Opportunities

- **Track 1 (Logging)**: Tasks 2, 10a (log tests)
- **Track 2 (Updates)**: Tasks 3, 4, 5, 10b (update tests)
- **Track 3 (Crashes)**: Tasks 6, 7, 8, 10c (crash tests)
- **Track 4 (Config/Docs)**: Tasks 9, 11 (can work alongside implementation)

## Validation Checklist

After completing all tasks, verify:

- [x] `window.electronAPI.log.info('test')` writes to `logs/main.log` with [Renderer:N] tag
- [x] Update check triggers notification banner in UI
- [x] "Install & Restart" button successfully updates the app
- [x] Crash reports appear in Sentry dashboard when enabled
- [x] No crash reports sent when `crashReporting.enabled = false`
- [x] All sensitive data (file paths, env vars) sanitized in crash reports
- [x] Log file contains entries from both main and renderer processes
- [x] No ESLint errors or warnings
- [x] All tests pass: `npm test`
- [x] Manual smoke test on target platforms (macOS, Windows, Linux)
