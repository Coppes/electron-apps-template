# Change: Add Observability and Maintenance Features

## Why
The current Electron application has basic auto-updater scaffolding and logging infrastructure (`electron-updater`, `electron-log`, `error-handler.js`), but lacks complete implementation for production observability and maintenance. The existing code has TODOs for renderer notifications, no renderer-side logging API, and no crash reporting integration. Production applications need unified logging across processes, automatic update notifications with user prompts, and comprehensive error tracking to diagnose issues in deployed environments. This change completes the observability foundation for enterprise-ready desktop applications.

## What Changes
- **Auto-Updater Completion**: Complete the existing `updater.js` scaffolding by implementing renderer notifications, UI components for update prompts, and configurable update behaviors (silent, interactive, forced)
- **Unified Logging System**: Extend the existing `logger.js` to expose logging API to renderer process via preload, enabling unified log collection from both main and renderer processes in a single file
- **Crash Reporting Integration**: Add optional crash reporting with Sentry or similar service, capturing crashes from both main and renderer processes with context (version, platform, logs) for debugging production issues
- **Update Notifications UI**: Create shadcn/ui Alert component for displaying update availability and download progress, with user actions (install, dismiss, view changelog)

## Impact
- **Affected specs**: Creates 3 new capabilities:
  - `auto-updater` - Complete auto-update flow with notifications and user interaction
  - `logging` - Unified logging system accessible from main and renderer processes
  - `crash-reporting` - Error tracking and crash reporting for production monitoring

- **Affected code**:
  - `src/main/updater.js` - Complete TODOs: add window notification logic for update events
  - `src/main/logger.js` - Add method to expose log instance for preload bridge
  - `src/preload.js` - Add `log` API namespace with `info()`, `warn()`, `error()`, `debug()` methods
  - `src/main/error-handler.js` - Add crash reporting integration hooks
  - `src/renderer/components/UpdateNotification.jsx` (new) - Update alert UI component
  - `src/renderer/App.jsx` - Integrate UpdateNotification component and event listeners
  - `src/common/constants.js` - Add constants for crash reporting (API keys moved to config)
  - `src/main/config.js` - Add crash reporting configuration section
  - `package.json` - Add optional `@sentry/electron` dependency

- **Breaking changes**: None - all additions are backward compatible

## Dependencies
- Existing `electron-updater@^6.6.2` (already installed)
- Existing `electron-log@^5.4.3` (already installed)
- Optional: `@sentry/electron@^5.0.0` for crash reporting (configurable)
- Existing shadcn/ui components (Alert, Button) for update UI

## Success Criteria
- [ ] Auto-updater sends notifications to renderer when updates are available/downloaded
- [ ] Update notification UI appears in renderer with options (install, dismiss)
- [ ] Renderer can write logs via `window.electronAPI.log.info()` that appear in main.log
- [ ] Crash reporting captures main process crashes with diagnostics
- [ ] Crash reporting captures renderer process crashes with stack traces
- [ ] Crash reporting can be disabled via configuration for privacy
- [ ] All logging includes timestamps, process type (main/renderer), and log level
- [ ] Update flow tested: check → available → download → prompt → install
- [ ] Logs from both processes appear in unified `logs/main.log` file
- [ ] All new code includes JSDoc type annotations
