# Implementation Tasks

## 1. Setup and Dependencies

- [x] Install required npm packages: `electron-log`, `electron-updater`
- [x] Install optional dev dependencies: `electron-devtools-installer`, `nodemon`
- [x] Create directory structure: `src/main/`, `src/common/`
- [x] Verify all dependencies resolve correctly with `npm install`

## 2. Common Types and Constants

- [x] Create `src/common/constants.js` with IPC channel names as constants
- [x] Create `src/common/types.js` with JSDoc type definitions for IPC schemas
- [x] Export window types (main, settings, about) as constants
- [x] Export default window configurations as constants
- [ ] Add unit tests for constants integrity

## 3. Enhanced Logging System

- [x] Create `src/main/logger.js` wrapper around electron-log
- [x] Implement log levels (debug, info, warn, error)
- [x] Configure file output to user data directory with rotation
- [x] Add console transport for development mode
- [x] Include timestamp and context metadata in log format
- [x] Test logging to file and console in both dev and prod modes
- [x] Document logger API with JSDoc

## 4. Window Manager Module

- [x] Create `src/main/window-manager.js` class
- [x] Implement `createWindow(type, options)` method with validation
- [x] Implement state persistence using electron-store
- [x] Add `saveState(windowId)` and `restoreState(windowId)` methods
- [x] Implement multi-window tracking with Map data structure
- [x] Add `getWindow(id)`, `getAllWindows()`, `closeWindow(id)` methods
- [x] Ensure windows are visible on screen (bounds checking)
- [x] Add event handlers for window lifecycle (close, focus, blur)
- [x] Test window creation, state save/restore, and multi-window scenarios
- [x] Document WindowManager API with JSDoc

## 5. Application Menu

- [x] Create `src/main/menu.js` with default menu template
- [x] Implement platform-specific menu items (macOS vs Windows/Linux)
- [x] Add File, Edit, View, Window, Help menus
- [x] Implement menu actions (New Window, Close Window, Quit, etc.)
- [x] Support custom menu item injection
- [ ] Test menu creation on macOS and Windows
- [x] Document menu customization patterns

## 6. Security Module

- [x] Create `src/main/security/csp.js` with CSP policy definitions
- [x] Create `src/main/security/navigation-guard.js` for URL filtering
- [x] Implement `setupNavigationGuard(contents)` for will-navigate events
- [x] Implement `setWindowOpenHandler` for new window security
- [x] Create allowlist for development (localhost origins)
- [x] Add CSP header injection for production windows
- [x] Create `src/main/security/context-isolation.js` with security patterns
- [ ] Test CSP blocks unauthorized scripts and resources
- [ ] Test navigation guards block external URLs
- [x] Document security configuration and best practices

## 7. IPC Bridge and Schema

- [x] Create `src/main/ipc/schema.js` with channel definitions
- [x] Define input/output schemas for each channel with JSDoc types
- [x] Create `src/main/ipc/bridge.js` with validation logic
- [x] Implement `registerHandlers(schema)` function
- [x] Implement input validation before handler execution
- [x] Implement output validation before returning to renderer
- [x] Add error handling and standardized error responses
- [x] Create `src/main/ipc/handlers/window.js` for window IPC
- [x] Create `src/main/ipc/handlers/store.js` for store IPC
- [x] Create `src/main/ipc/handlers/dialog.js` for dialog IPC
- [ ] Test IPC validation catches invalid inputs
- [ ] Test IPC errors are handled gracefully
- [x] Document IPC schema format and validation rules

## 8. Preload Script Enhancement

- [x] Refactor `src/preload.js` to use IPC schema constants
- [x] Add JSDoc documentation for all exposed methods
- [x] Implement event listener cleanup functions
- [x] Freeze/seal window.electronAPI to prevent extension
- [ ] Test contextBridge isolation works correctly
- [ ] Test all IPC methods are accessible from renderer
- [x] Document renderer API surface

## 9. Application Lifecycle Manager

- [x] Create `src/main/lifecycle.js` class
- [x] Implement `startup()` method with ordered initialization
- [x] Implement `shutdown()` method with graceful cleanup
- [x] Add startup error handling and recovery
- [x] Implement single instance lock with `app.requestSingleInstanceLock()`
- [x] Handle 'second-instance' event to focus existing window
- [x] Add crash marker file creation and detection
- [x] Implement crash recovery dialog
- [ ] Test startup sequence completes in correct order
- [ ] Test shutdown saves state before exit
- [ ] Test single instance prevents multiple launches
- [x] Document lifecycle hooks and extension points

## 10. Auto-Updater Scaffolding

- [x] Create `src/main/updater.js` using electron-updater
- [x] Implement update check on startup (production only)
- [x] Add event handlers (update-available, download-progress, update-downloaded)
- [x] Implement user notification for available updates
- [ ] Add configuration file placeholder (electron-builder.yml)
- [ ] Test update check (requires release server setup)
- [x] Document update server configuration requirements
- [x] Mark as optional/scaffolding if server not configured

## 11. Deep Linking Support

- [x] Register custom protocol (e.g., 'myapp://') using `app.setAsDefaultProtocolClient()`
- [x] Handle 'open-url' event on macOS
- [x] Handle command-line arguments on Windows/Linux
- [x] Implement URL parsing and validation
- [x] Route deep links to appropriate views in renderer
- [ ] Test deep link opens app when closed
- [ ] Test deep link focuses app when running
- [x] Document protocol registration and URL patterns

## 12. Developer Tools Integration

- [x] Create `src/main/dev-tools.js` module
- [x] Implement auto-open DevTools in development
- [x] Install React DevTools extension in development
- [x] Add environment detection (isDevelopment helper)
- [x] Disable DevTools in production builds
- [x] Configure nodemon or electron-reloader for main process HMR
- [ ] Test DevTools open automatically in dev mode
- [ ] Test React DevTools extension loads correctly
- [x] Document development workflow and tools

## 13. Error Handling Framework

- [x] Add global error handler for uncaught exceptions in main process
- [x] Add global handler for unhandled promise rejections
- [x] Create error dialog utility for user-facing errors
- [ ] Implement error reporting from renderer to main via IPC
- [ ] Add React error boundaries in renderer (create ErrorBoundary component)
- [x] Collect diagnostics on error (version, platform, logs)
- [ ] Test main process errors are caught and logged
- [ ] Test renderer errors show fallback UI
- [x] Document error handling patterns

## 14. Main Process Refactoring

- [x] Refactor `src/main.js` to use new modules
- [x] Replace inline window creation with WindowManager
- [x] Replace inline IPC handlers with IPC bridge
- [x] Use LifecycleManager for startup/shutdown
- [x] Apply security guards from security module
- [x] Initialize logger at startup
- [x] Remove redundant code after refactoring
- [ ] Verify all existing functionality still works
- [ ] Test application start and stop cleanly

## 15. Configuration Management

- [x] Create `src/main/config.js` for environment-specific settings
- [x] Support NODE_ENV-based configuration loading
- [x] Add support for environment variable overrides
- [x] Document configuration options and defaults
- [x] Test configuration loads correctly for dev/prod

## 16. Testing and Validation

- [ ] Write unit tests for WindowManager (window creation, state persistence)
- [ ] Write unit tests for IPC validation (valid/invalid inputs)
- [ ] Write unit tests for security guards (CSP, navigation blocking)
- [ ] Write integration tests for lifecycle (startup/shutdown)
- [ ] Write integration tests for IPC end-to-end communication
- [ ] Test cross-platform compatibility (macOS, Windows, Linux)
- [ ] Run full test suite and achieve >80% coverage
- [ ] Fix any failing tests

## 17. Documentation

- [ ] Update README.md with new features overview
- [ ] Create ARCHITECTURE.md documenting module structure
- [ ] Document IPC API in API.md with all channels
- [ ] Create SECURITY.md with security best practices
- [x] Add inline code comments for complex logic
- [ ] Create example usage guide for common tasks
- [ ] Document troubleshooting common issues

## 18. Performance Optimization

- [x] Add startup timing measurements
- [x] Add IPC performance monitoring in development
- [x] Implement memory usage tracking in development
- [ ] Optimize window state save/restore for large state
- [ ] Profile and optimize hot paths if needed

## 19. Final Validation

- [ ] Run `openspec validate add-electron-core-features --strict`
- [ ] Resolve all validation errors
- [ ] Run full test suite with coverage report
- [ ] Build application for production and test packaged app
- [ ] Verify all acceptance criteria from proposal.md are met
- [ ] Create demo video or screenshots of new features
- [ ] Request code review from team

## Dependencies Between Tasks

- Task 2 (Common) must complete before Tasks 4, 7, and 9
- Task 3 (Logger) must complete before all other tasks that log
- Task 4 (WindowManager) must complete before Task 14 (Refactoring)
- Task 7 (IPC Bridge) must complete before Task 8 (Preload)
- Task 9 (Lifecycle) should complete before Task 14 (Refactoring)
- Tasks 3-13 can be developed in parallel by different developers
- Task 14 (Refactoring) integrates everything and should be near the end
- Task 16 (Testing) runs continuously alongside feature development
- Task 17 (Documentation) runs continuously alongside feature development
- Task 19 (Validation) is the final gate before completion

## Parallel Work Opportunities

- **Track 1 (Infrastructure)**: Tasks 2, 3, 15 (Common, Logger, Config)
- **Track 2 (Window Management)**: Tasks 4, 5 (WindowManager, Menu)
- **Track 3 (Security)**: Task 6 (Security Module)
- **Track 4 (IPC)**: Tasks 7, 8 (IPC Bridge, Preload)
- **Track 5 (Lifecycle)**: Tasks 9, 10, 11 (Lifecycle, Updater, Deep Linking)
- **Track 6 (Dev Tools)**: Tasks 12, 13, 18 (DevTools, Errors, Performance)

All tracks converge at Task 14 (Main Refactoring) for integration.
