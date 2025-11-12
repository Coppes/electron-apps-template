# Implementation Tasks: Improve Test Infrastructure

## Phase 1: Test Infrastructure Setup (Week 1)

### Task 1.1: Configure Vitest for main process

- [ ] Create `vitest.config.main.js` with Node.js environment
- [ ] Configure include patterns for main process tests
- [ ] Configure coverage for src/main/**/*.js
- [ ] Exclude entry points (main.js, preload.js) from coverage
- [ ] Add test:main script to package.json
- [ ] Validate: npm run test:main executes successfully

### Task 1.2: Configure Vitest for renderer process

- [ ] Create `vitest.config.renderer.js` with jsdom environment
- [ ] Configure include patterns for renderer tests
- [ ] Configure coverage for src/renderer/**/*.{js,jsx}
- [ ] Setup alias for @ pointing to src/renderer
- [ ] Add test:renderer script to package.json
- [ ] Validate: npm run test:renderer executes successfully

### Task 1.3: Create test setup files

- [ ] Create `test/setup/vitest.setup.main.js` for main process
- [ ] Create `test/setup/vitest.setup.renderer.js` for renderer process
- [ ] Import @testing-library/jest-dom in renderer setup
- [ ] Configure global test utilities
- [ ] Add beforeEach/afterEach hooks for cleanup
- [ ] Validate: Setup files load correctly

### Task 1.4: Create test directory structure

- [ ] Create test/setup/ directory
- [ ] Create test/fixtures/ directory
- [ ] Create test/unit/main/ directory
- [ ] Create test/unit/renderer/ directory
- [ ] Create test/integration/ directory
- [ ] Create test/e2e/ directory
- [ ] Validate: Structure matches design.md

## Phase 2: Mocks and Fixtures (Week 1)

### Task 2.1: Create Electron API mocks

- [ ] Create `test/setup/electron-mocks.js`
- [ ] Mock BrowserWindow (constructor, static methods, instance methods)
- [ ] Mock app (getPath, getVersion, quit, on, whenReady)
- [ ] Mock dialog (showOpenDialog, showSaveDialog, showMessageBox)
- [ ] Mock ipcMain (handle, on, removeHandler)
- [ ] Mock ipcRenderer (invoke, send, on)
- [ ] Mock session (setPermissionRequestHandler, etc.)
- [ ] Mock shell (openExternal, openPath)
- [ ] Validate: All mocks are callable and return expected types

### Task 2.2: Create electronAPI mock for renderer

- [ ] Create complete mockElectronAPI in electron-mocks.js
- [ ] Mock setTitle, openFile, saveFile methods
- [ ] Mock events object with onUpdateAvailable, onUpdateDownloaded, etc.
- [ ] Mock store object (get, set, delete, has)
- [ ] All event handlers return cleanup functions
- [ ] Export mockElectronAPI for renderer tests
- [ ] Update vitest.setup.renderer.js to use mockElectronAPI
- [ ] Validate: window.electronAPI is fully mocked

### Task 2.3: Create test fixtures

- [ ] Create `test/fixtures/window-fixtures.js` with window states
- [ ] Create `test/fixtures/ipc-fixtures.js` with IPC payloads
- [ ] Create `test/fixtures/app-fixtures.js` with app states
- [ ] Add valid and invalid payloads for each IPC channel
- [ ] Add edge cases (empty, null, undefined, large data)
- [ ] Export all fixtures as named exports
- [ ] Validate: Fixtures are importable and well-typed

### Task 2.4: Create test helpers

- [ ] Create `test/setup/test-helpers.js`
- [ ] Add createMockWindow() helper
- [ ] Add createMockWebContents() helper
- [ ] Add waitForIpc() helper for async IPC tests
- [ ] Add mockLogger() to prevent log spam in tests
- [ ] Add resetAllMocks() to clear all vi.mock calls
- [ ] Export all helpers
- [ ] Validate: Helpers work in test files

## Phase 3: Unit Tests - Main Process (Week 2)

### Task 3.1: Test window-manager module

- [ ] Create `test/unit/main/window-manager.test.js`
- [ ] Mock electron.BrowserWindow
- [ ] Test createWindow() creates window with correct options
- [ ] Test createWindow() prevents duplicate windows
- [ ] Test getWindowByType() returns correct window
- [ ] Test getAllWindows() returns all windows
- [ ] Test closeWindow() closes specific window
- [ ] Test closeAllWindows() closes all windows
- [ ] Test saveWindowState() persists state
- [ ] Test restoreWindowState() loads saved state
- [ ] Validate: >80% coverage for window-manager

### Task 3.2: Test logger module

- [ ] Create `test/unit/main/logger.test.js`
- [ ] Mock fs and console
- [ ] Test logger.info() logs to console and file
- [ ] Test logger.error() logs with stack trace
- [ ] Test logger.warn() logs warnings
- [ ] Test logger.debug() only logs in development
- [ ] Test log file rotation
- [ ] Test log levels (info, warn, error, debug)
- [ ] Test structured logging (object payloads)
- [ ] Validate: >80% coverage for logger

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

- [ ] Migrate test/security.*.test.js to test/unit/security/
- [ ] Remove placeholder tests (expect(true).toBe(true))
- [ ] Implement real mocks for WebContents, session
- [ ] Test CSP header building with actual values
- [ ] Test navigation guard blocks unauthorized URLs
- [ ] Test permission handler prompts user
- [ ] Test audit log writes to file
- [ ] Add tests for edge cases and error paths
- [ ] Validate: >80% coverage for all security modules

## Phase 4: Unit Tests - Renderer Process (Week 2-3)

### Task 4.1: Test React components

- [ ] Update src/renderer/App.test.jsx to use mockElectronAPI
- [ ] Update src/renderer/components/Demo.test.jsx
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

- [ ] Ensure mockElectronAPI is available in all renderer tests
- [ ] Fix "Cannot read properties of undefined" errors
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

- [ ] Create `.github/workflows/test.yml`
- [ ] Configure matrix for [ubuntu, windows, macos]
- [ ] Configure Node.js versions [18.x, 20.x]
- [ ] Add checkout and setup-node steps
- [ ] Add npm ci step with cache
- [ ] Add test:unit step
- [ ] Add test:integration step
- [ ] Add test:coverage step
- [ ] Validate: Workflow file is valid YAML

### Task 7.2: Configure coverage reporting

- [ ] Generate lcov coverage format
- [ ] Add Codecov integration
- [ ] Upload coverage only from ubuntu-latest
- [ ] Add coverage badge to README.md
- [ ] Set coverage threshold to 80%
- [ ] Fail CI if coverage drops below threshold
- [ ] Validate: Coverage is uploaded to Codecov

### Task 7.3: Add E2E tests to CI

- [ ] Create separate e2e job in workflow
- [ ] Install Playwright with dependencies
- [ ] Run test:e2e script
- [ ] Upload test artifacts on failure (screenshots, traces)
- [ ] Run E2E only on main branch and PRs
- [ ] Skip E2E on draft PRs
- [ ] Validate: E2E tests run in CI

### Task 7.4: Configure CI caching and optimization

- [ ] Cache node_modules with actions/cache
- [ ] Cache Playwright binaries
- [ ] Run unit and integration tests in parallel
- [ ] Fail fast if any job fails
- [ ] Add concurrency groups to cancel outdated runs
- [ ] Optimize workflow for speed (<10 min total)
- [ ] Validate: CI runs efficiently

## Phase 8: Documentation and Finalization (Week 4)

### Task 8.1: Create testing guide

- [ ] Create `TESTING.md` documentation
- [ ] Document how to run tests locally
- [ ] Document test file naming conventions
- [ ] Document mock and fixture usage
- [ ] Document how to debug failing tests
- [ ] Add examples of good test patterns
- [ ] Document E2E test setup and execution
- [ ] Validate: Documentation is clear and complete

### Task 8.2: Update package.json scripts

- [ ] Add test:unit (runs unit tests only)
- [ ] Add test:integration (runs integration tests)
- [ ] Add test:e2e (runs E2E tests)
- [ ] Add test:coverage (runs with coverage)
- [ ] Add test:watch (watch mode for development)
- [ ] Add test:ui (opens Vitest UI)
- [ ] Update existing test script to run all tests
- [ ] Validate: All scripts work correctly

### Task 8.3: Update README and documentation

- [ ] Add testing section to README.md
- [ ] Add coverage badge
- [ ] Add link to TESTING.md
- [ ] Update CI/CD section with GitHub Actions
- [ ] Document required Node.js and npm versions for tests
- [ ] Add troubleshooting section for common test issues
- [ ] Validate: README is up-to-date

### Task 8.4: Final validation

- [ ] Run all tests locally and verify they pass
- [ ] Verify coverage meets >80% threshold
- [ ] Run E2E tests and verify they pass
- [ ] Push to GitHub and verify CI passes
- [ ] Check coverage report on Codecov
- [ ] Verify tests run on all platforms (macOS, Windows, Linux)
- [ ] Document any platform-specific issues
- [ ] Validate: All tests pass in CI

## Summary

- **Total Tasks**: 74
- **Estimated Effort**: ~70 hours
- **Parallelizable**: Infrastructure and mocks can be built in parallel with test migration
- **Dependencies**: Phase 1-2 must complete before Phase 3-6
- **Critical Path**: Infrastructure → Unit Tests → Integration Tests → E2E → CI/CD
