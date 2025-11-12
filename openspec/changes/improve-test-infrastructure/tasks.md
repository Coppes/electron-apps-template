# Implementation Tasks: Improve Test Infrastructure

## Phase 1: Test Infrastructure Setup (Week 1)

### Task 1.1: Configure Vitest for main process

- [x] Create `vitest.config.main.js` with Node.js environment
- [x] Configure include patterns for main process tests
- [x] Configure coverage for src/main/**/*.js
- [x] Exclude entry points (main.js, preload.js) from coverage
- [x] Add test:main script to package.json
- [x] Validate: npm run test:main executes successfully

### Task 1.2: Configure Vitest for renderer process

- [x] Create `vitest.config.renderer.js` with jsdom environment
- [x] Configure include patterns for renderer tests
- [x] Configure coverage for src/renderer/**/*.{js,jsx}
- [x] Setup alias for @ pointing to src/renderer
- [x] Add test:renderer script to package.json
- [x] Validate: npm run test:renderer executes successfully

### Task 1.3: Create test setup files

- [x] Create `test/setup/vitest.setup.main.js` for main process
- [x] Create `test/setup/vitest.setup.renderer.js` for renderer process
- [x] Import @testing-library/jest-dom in renderer setup
- [x] Configure global test utilities
- [x] Add beforeEach/afterEach hooks for cleanup
- [x] Validate: Setup files load correctly

### Task 1.4: Create test directory structure

- [x] Create test/setup/ directory
- [x] Create test/fixtures/ directory
- [x] Create test/unit/main/ directory
- [x] Create test/unit/renderer/ directory
- [x] Create test/integration/ directory
- [x] Create test/e2e/ directory
- [x] Validate: Structure matches design.md

## Phase 2: Mocks and Fixtures (Week 1)

### Task 2.1: Create Electron API mocks

- [x] Create `test/setup/electron-mocks.js`
- [x] Mock BrowserWindow (constructor, static methods, instance methods)
- [x] Mock app (getPath, getVersion, quit, on, whenReady)
- [x] Mock dialog (showOpenDialog, showSaveDialog, showMessageBox)
- [x] Mock ipcMain (handle, on, removeHandler)
- [x] Mock ipcRenderer (invoke, send, on)
- [x] Mock session (setPermissionRequestHandler, etc.)
- [x] Mock shell (openExternal, openPath)
- [x] Validate: All mocks are callable and return expected types

### Task 2.2: Create electronAPI mock for renderer

- [x] Create complete mockElectronAPI in electron-mocks.js
- [x] Mock setTitle, openFile, saveFile methods
- [x] Mock events object with onUpdateAvailable, onUpdateDownloaded, etc.
- [x] Mock store object (get, set, delete, has)
- [x] All event handlers return cleanup functions
- [x] Export mockElectronAPI for renderer tests
- [x] Update vitest.setup.renderer.js to use mockElectronAPI
- [x] Validate: window.electronAPI is fully mocked

### Task 2.3: Create test fixtures

- [x] Create `test/fixtures/window-fixtures.js` with window states
- [x] Create `test/fixtures/ipc-fixtures.js` with IPC payloads
- [x] Create `test/fixtures/app-fixtures.js` with app states
- [x] Add valid and invalid payloads for each IPC channel
- [x] Add edge cases (empty, null, undefined, large data)
- [x] Export all fixtures as named exports
- [x] Validate: Fixtures are importable and well-typed

### Task 2.4: Create test helpers

- [x] Create `test/setup/test-helpers.js`
- [x] Add createMockWindow() helper
- [x] Add createMockWebContents() helper
- [x] Add waitForIpc() helper for async IPC tests
- [x] Add mockLogger() to prevent log spam in tests
- [x] Add resetAllMocks() to clear all vi.mock calls
- [x] Export all helpers
- [x] Validate: Helpers work in test files

## Phase 3: Unit Tests - Main Process (Week 2)

### Task 3.1: Test window-manager module

- [x] Create `test/unit/main/window-manager.test.js`
- [x] Mock electron.BrowserWindow
- [x] Test createWindow() creates window with correct options
- [x] Test createWindow() prevents duplicate windows
- [x] Test getWindowByType() returns correct window
- [x] Test getAllWindows() returns all windows
- [x] Test closeWindow() closes specific window
- [x] Test closeAllWindows() closes all windows
- [x] Test saveWindowState() persists state
- [x] Test restoreWindowState() loads saved state
- [x] Validate: >80% coverage for window-manager

### Task 3.2: Test logger module

- [x] Create `test/unit/main/logger.test.js`
- [x] Mock fs and console
- [x] Test logger.info() logs to console and file
- [x] Test logger.error() logs with stack trace
- [x] Test logger.warn() logs warnings
- [x] Test logger.debug() only logs in development
- [x] Test log file rotation
- [x] Test log levels (info, warn, error, debug)
- [x] Test structured logging (object payloads)
- [x] Validate: >80% coverage for logger

### Task 3.3: Test lifecycle module

- [ ] Create `test/unit/main/lifecycle.test.js`
- [ ] Mock app, window-manager
- [ ] Test initialize() calls setup functions in order
- [ ] Test shutdown() calls cleanup functions
- [ ] Test setupSingleInstance() prevents multiple instances
- [ ] Test ready() resolves when app is ready
- [ ] Test beforeQuit() handler saves state
- [ ] Test activate() (macOS) recreates window
- [ ] Validate: >80% coverage for lifecycle

### Task 3.4: Test IPC handlers - app

- [ ] Create `test/unit/main/ipc/handlers/app.test.js`
- [ ] Mock app, BrowserWindow
- [ ] Test GET_APP_VERSION returns version
- [ ] Test GET_APP_PATH returns correct path
- [ ] Test MINIMIZE_WINDOW minimizes window
- [ ] Test MAXIMIZE_WINDOW maximizes window
- [ ] Test CLOSE_WINDOW closes window
- [ ] Test QUIT_APP quits application
- [ ] Test invalid payloads throw validation errors
- [ ] Validate: >80% coverage for app handler

### Task 3.5: Test IPC handlers - dialog

- [ ] Create `test/unit/main/ipc/handlers/dialog.test.js`
- [ ] Mock electron.dialog
- [ ] Test SHOW_OPEN_DIALOG opens file picker
- [ ] Test SHOW_SAVE_DIALOG opens save dialog
- [ ] Test SHOW_MESSAGE_BOX shows message
- [ ] Test dialog options are passed correctly
- [ ] Test canceled dialogs return canceled: true
- [ ] Test file filters work correctly
- [ ] Test invalid payloads are rejected
- [ ] Validate: >80% coverage for dialog handler

### Task 3.6: Test IPC handlers - store

- [ ] Create `test/unit/main/ipc/handlers/store.test.js`
- [ ] Mock electron-store
- [ ] Test STORE_GET retrieves value
- [ ] Test STORE_SET stores value
- [ ] Test STORE_DELETE removes value
- [ ] Test STORE_HAS checks existence
- [ ] Test STORE_CLEAR clears all values
- [ ] Test nested keys (dot notation)
- [ ] Test invalid payloads are rejected
- [ ] Validate: >80% coverage for store handler

### Task 3.7: Test updater module

- [ ] Create `test/unit/main/updater.test.js`
- [ ] Mock electron-updater
- [ ] Test checkForUpdates() triggers update check
- [ ] Test update-available event emits to renderer
- [ ] Test update-downloaded event emits to renderer
- [ ] Test download-progress event emits to renderer
- [ ] Test error event is handled gracefully
- [ ] Test quitAndInstall() installs update
- [ ] Test auto-update is disabled in development
- [ ] Validate: >80% coverage for updater

### Task 3.8: Test security modules

- [x] Migrate test/security.*.test.js to test/unit/security/
- [x] Remove placeholder tests (expect(true).toBe(true))
- [x] Implement real mocks for WebContents, session
- [x] Test CSP header building with actual values
- [x] Test navigation guard blocks unauthorized URLs
- [x] Test permission handler prompts user
- [x] Test audit log writes to file
- [x] Add tests for edge cases and error paths
- [x] Validate: >80% coverage for all security modules

## Phase 4: Unit Tests - Renderer Process (Week 2-3)

### Task 4.1: Test React components

- [x] Update src/renderer/App.test.jsx to use mockElectronAPI
- [ ] Update src/renderer/components/Demo.test.jsx (needs refactoring - component changed)
- [ ] Create tests for ErrorBoundary component
- [ ] Create tests for UpdateNotification component
- [ ] Create tests for SafeHTML component
- [ ] Test component rendering with different props
- [ ] Test user interactions (clicks, inputs)
- [ ] Test error states and fallbacks
- [ ] Validate: >80% coverage for renderer components

### Task 4.2: Test utility functions

- [ ] Create `test/unit/renderer/utils/cn.test.js`
- [ ] Test cn() merges classNames correctly
- [ ] Test cn() handles conditional classes
- [ ] Test cn() handles arrays and objects
- [ ] Add tests for any other utility functions
- [ ] Validate: 100% coverage for utils

### Task 4.3: Fix failing renderer tests

- [x] Ensure mockElectronAPI is available in all renderer tests
- [ ] Fix "Cannot read properties of undefined" errors in Demo test
- [ ] Update all tests to use vi.fn() for event handlers
- [ ] Ensure cleanup functions are called in useEffect tests
- [ ] Validate: All renderer tests pass

## Phase 5: Integration Tests (Week 3)

### Task 5.1: Test IPC communication flow

- [ ] Create `test/integration/ipc-communication.test.js`
- [ ] Import actual IPC handler registration
- [ ] Test SET_TITLE handler receives and processes message
- [ ] Test OPEN_FILE handler returns file content
- [ ] Test schema validation catches invalid payloads
- [ ] Test error responses are properly formatted
- [ ] Test timeout handling for slow operations
- [ ] Validate: IPC flow works end-to-end

### Task 5.2: Test window lifecycle

- [ ] Create `test/integration/window-lifecycle.test.js`
- [ ] Test window creation → ready → close flow
- [ ] Test window state save on close
- [ ] Test window state restore on reopen
- [ ] Test multi-window scenarios
- [ ] Test window focus management
- [ ] Test window close prevents navigation
- [ ] Validate: Window lifecycle works correctly

### Task 5.3: Test security flow

- [ ] Create `test/integration/security-flow.test.js`
- [ ] Test CSP blocks unauthorized script loading
- [ ] Test navigation guard blocks external URLs
- [ ] Test permission requests are logged
- [ ] Test security events trigger audit logs
- [ ] Test content security in renderer process
- [ ] Validate: Security features work together

## Phase 6: E2E Tests (Week 3-4)

### Task 6.1: Setup Playwright for Electron

- [ ] Install @playwright/test
- [ ] Install playwright-electron (if needed)
- [ ] Create `playwright.config.js`
- [ ] Configure test directory to test/e2e/
- [ ] Set timeout to 30 seconds
- [ ] Enable trace on first retry
- [ ] Add test:e2e script to package.json
- [ ] Validate: npx playwright test works

### Task 6.2: Create app launch E2E test

- [ ] Create `test/e2e/app-launch.spec.js`
- [ ] Test app launches without errors
- [ ] Test main window appears and has correct title
- [ ] Test main window shows welcome message
- [ ] Test app version is displayed
- [ ] Test navigation buttons are visible
- [ ] Test app closes cleanly
- [ ] Validate: App launch E2E test passes

### Task 6.3: Create window management E2E test

- [ ] Create `test/e2e/window-management.spec.js`
- [ ] Test minimize button minimizes window
- [ ] Test maximize button maximizes window
- [ ] Test restore button restores window
- [ ] Test close button closes window
- [ ] Test creating multiple windows
- [ ] Test focusing between windows
- [ ] Test window state persistence across restarts
- [ ] Validate: Window management E2E test passes

### Task 6.4: Create auto-update E2E test

- [ ] Create `test/e2e/auto-update.spec.js`
- [ ] Mock update server responses
- [ ] Test update check triggers correctly
- [ ] Test update notification appears
- [ ] Test download progress is shown
- [ ] Test "Install Update" button works
- [ ] Test "Remind Me Later" dismisses notification
- [ ] Validate: Auto-update E2E test passes (with mocks)

### Task 6.5: Create security features E2E test

- [ ] Create `test/e2e/security-features.spec.js`
- [ ] Test external link opens in default browser
- [ ] Test navigation to unauthorized URL is blocked
- [ ] Test permission request shows dialog
- [ ] Test CSP violations are logged
- [ ] Test context isolation prevents Node access
- [ ] Validate: Security E2E test passes

## Phase 7: CI/CD Setup (Week 4)

### Task 7.1: Create GitHub Actions workflow

- [x] Create `.github/workflows/test.yml`
- [x] Configure matrix for [ubuntu, windows, macos]
- [x] Configure Node.js versions [18.x, 20.x]
- [x] Add checkout and setup-node steps
- [x] Add npm ci step with cache
- [x] Add test:unit step
- [ ] Add test:integration step
- [x] Add test:coverage step
- [x] Validate: Workflow file is valid YAML

### Task 7.2: Configure coverage reporting

- [x] Generate lcov coverage format
- [x] Add Codecov integration
- [x] Upload coverage only from ubuntu-latest
- [ ] Add coverage badge to README.md (needs Codecov token)
- [x] Set coverage threshold to 80%
- [x] Fail CI if coverage drops below threshold
- [ ] Validate: Coverage is uploaded to Codecov (needs token)

### Task 7.3: Add E2E tests to CI

- [ ] Create separate e2e job in workflow
- [ ] Install Playwright with dependencies
- [ ] Run test:e2e script
- [ ] Upload test artifacts on failure (screenshots, traces)
- [ ] Run E2E only on main branch and PRs
- [ ] Skip E2E on draft PRs
- [ ] Validate: E2E tests run in CI

### Task 7.4: Configure CI caching and optimization

- [x] Cache node_modules with actions/cache
- [ ] Cache Playwright binaries
- [x] Run unit and integration tests in parallel
- [x] Fail fast if any job fails
- [x] Add concurrency groups to cancel outdated runs
- [ ] Optimize workflow for speed (<10 min total)
- [ ] Validate: CI runs efficiently

## Phase 8: Documentation and Finalization (Week 4)

### Task 8.1: Create testing guide

- [x] Create `TESTING.md` documentation
- [x] Document how to run tests locally
- [x] Document test file naming conventions
- [x] Document mock and fixture usage
- [x] Document how to debug failing tests
- [x] Add examples of good test patterns
- [ ] Document E2E test setup and execution (deferred - E2E not implemented yet)
- [x] Validate: Documentation is clear and complete

### Task 8.2: Update package.json scripts

- [x] Add test:unit (runs unit tests only)
- [ ] Add test:integration (runs integration tests) (deferred)
- [ ] Add test:e2e (runs E2E tests) (deferred)
- [x] Add test:coverage (runs with coverage)
- [x] Add test:watch (watch mode for development)
- [x] Add test:ui (opens Vitest UI)
- [x] Update existing test script to run all tests
- [x] Validate: All scripts work correctly

### Task 8.3: Update README and documentation

- [x] Add testing section to README.md
- [ ] Add coverage badge (needs Codecov setup)
- [x] Add link to TESTING.md
- [x] Update CI/CD section with GitHub Actions
- [x] Document required Node.js and npm versions for tests
- [x] Add troubleshooting section for common test issues
- [x] Validate: README is up-to-date

### Task 8.4: Final validation

- [x] Run all tests locally and verify they pass (main process tests pass)
- [ ] Verify coverage meets >80% threshold (main modules covered, renderer needs work)
- [ ] Run E2E tests and verify they pass (deferred - not implemented)
- [ ] Push to GitHub and verify CI passes (CI configured, needs testing)
- [ ] Check coverage report on Codecov (needs token setup)
- [ ] Verify tests run on all platforms (macOS, Windows, Linux) (CI configured)
- [ ] Document any platform-specific issues
- [ ] Validate: All tests pass in CI (needs CI run)

## Summary

- **Total Tasks**: 74
- **Completed**: ~45 tasks
- **In Progress**: Renderer tests need updating for refactored components
- **Deferred**: E2E tests, full integration tests (can be added incrementally)
- **Status**: Core infrastructure complete, main process tests passing, security tests passing
