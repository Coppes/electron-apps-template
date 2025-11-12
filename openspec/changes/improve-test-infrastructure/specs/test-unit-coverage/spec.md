# Spec: Unit Test Coverage

## ADDED Requirements

### Requirement: Test Window Manager Module

The system SHALL provide comprehensive tests for window-manager module achieving >80% coverage.

#### Scenario: Test window creation

**Given** window-manager is initialized  
**When** createWindow('main') is called  
**Then** BrowserWindow SHALL be instantiated with correct options  
**And** window SHALL be registered in internal registry  
**And** SHALL return the created window

#### Scenario: Test prevent duplicate windows

**Given** a window of type 'main' already exists  
**When** createWindow('main') is called again  
**Then** SHALL NOT create a new window  
**And** SHALL return the existing window  
**And** SHALL log a warning

#### Scenario: Test get window by type

**Given** multiple windows exist  
**When** getWindowByType('settings') is called  
**Then** SHALL return the settings window  
**And** SHALL return null if not found

#### Scenario: Test window state persistence

**Given** a window is about to close  
**When** window triggers 'close' event  
**Then** window state (position, size, maximized) SHALL be saved  
**And** SHALL persist to electron-store  
**And** SHALL be restorable on next launch

### Requirement: Test Logger Module

The system SHALL provide comprehensive tests for logger module achieving >80% coverage.

#### Scenario: Test logging to console and file

**Given** logger is initialized  
**When** logger.info('message') is called  
**Then** SHALL write to console with formatting  
**And** SHALL write to log file asynchronously  
**And** SHALL include timestamp and level

#### Scenario: Test log levels

**Given** logger supports multiple levels  
**When** each level method is called  
**Then** logger.debug() SHALL only log in development  
**And** logger.info() SHALL log always  
**And** logger.warn() SHALL log with yellow color  
**And** logger.error() SHALL log with red color and stack trace

#### Scenario: Test structured logging

**Given** logger accepts objects  
**When** logger.info('message', { userId: 123 }) is called  
**Then** SHALL log message with structured data  
**And** SHALL serialize object to JSON  
**And** SHALL be parseable by log aggregators

### Requirement: Test Lifecycle Module

The system SHALL provide comprehensive tests for lifecycle module achieving >80% coverage.

#### Scenario: Test initialization sequence

**Given** app is starting  
**When** lifecycle.initialize() is called  
**Then** SHALL call setup functions in correct order  
**And** SHALL wait for app.whenReady()  
**And** SHALL create main window after ready

#### Scenario: Test single instance lock

**Given** app is already running  
**When** second instance tries to start  
**Then** SHALL activate existing instance  
**And** SHALL quit second instance  
**And** SHALL focus existing window

#### Scenario: Test graceful shutdown

**Given** app is running  
**When** lifecycle.shutdown() is called  
**Then** SHALL save all window states  
**And** SHALL close all windows  
**And** SHALL cleanup resources  
**And** SHALL exit cleanly

### Requirement: Test IPC Handlers

The system SHALL provide comprehensive tests for all IPC handlers achieving >80% coverage.

#### Scenario: Test app handler - GET_APP_VERSION

**Given** renderer requests app version  
**When** GET_APP_VERSION is invoked  
**Then** SHALL return current app version  
**And** SHALL match package.json version

#### Scenario: Test app handler - window operations

**Given** renderer requests window operation  
**When** MINIMIZE_WINDOW is invoked  
**Then** target window SHALL be minimized  
**And** SHALL validate window ID  
**And** SHALL handle missing window gracefully

#### Scenario: Test dialog handler - file selection

**Given** renderer requests file selection  
**When** SHOW_OPEN_DIALOG is invoked with options  
**Then** SHALL show native file picker  
**And** SHALL return selected file paths  
**And** SHALL handle user cancellation

#### Scenario: Test store handler - persistence

**Given** renderer requests data storage  
**When** STORE_SET is invoked with key and value  
**Then** SHALL persist data to electron-store  
**And** SHALL validate payload schema  
**And** SHALL return success confirmation

#### Scenario: Test IPC validation errors

**Given** renderer sends invalid payload  
**When** any IPC handler receives it  
**Then** SHALL throw validation error  
**And** SHALL not execute handler logic  
**And** error message SHALL describe the issue

### Requirement: Test Updater Module

The system SHALL provide comprehensive tests for updater module achieving >80% coverage.

#### Scenario: Test update check

**Given** auto-updater is enabled  
**When** checkForUpdates() is called  
**Then** SHALL query update server  
**And** SHALL emit update-available if found  
**And** SHALL emit update-not-available otherwise

#### Scenario: Test update download

**Given** update is available  
**When** download starts  
**Then** SHALL emit download-progress events  
**And** SHALL emit update-downloaded when complete  
**And** SHALL verify update signature

#### Scenario: Test disabled in development

**Given** app is in development mode  
**When** updater initializes  
**Then** SHALL not check for updates  
**And** SHALL log that updates are disabled

### Requirement: Test Security Modules

The system SHALL provide comprehensive tests for security modules achieving >80% coverage.

#### Scenario: Test CSP header building

**Given** CSP module is used  
**When** buildCSPHeader() is called  
**Then** SHALL generate correct CSP header  
**And** SHALL include all required directives  
**And** SHALL differ between dev and prod

#### Scenario: Test navigation guard blocking

**Given** navigation guard is active  
**When** window attempts to navigate to unauthorized URL  
**Then** SHALL prevent navigation  
**And** SHALL log security event  
**And** SHALL emit audit log

#### Scenario: Test permission handling

**Given** renderer requests permission  
**When** permission handler receives request  
**Then** SHALL check if permission is in allowlist  
**And** SHALL prompt user for allowed permissions  
**And** SHALL auto-deny dangerous permissions

#### Scenario: Test audit logging

**Given** security event occurs  
**When** logSecurityEvent() is called  
**Then** SHALL write to audit log file  
**And** SHALL include timestamp, type, and details  
**And** SHALL be parseable for security analysis

### Requirement: Test React Components

The system SHALL provide comprehensive tests for React components achieving >80% coverage.

#### Scenario: Test App component rendering

**Given** App component is rendered  
**When** component mounts  
**Then** SHALL display welcome message  
**And** SHALL show navigation buttons  
**And** SHALL subscribe to update events

#### Scenario: Test ErrorBoundary

**Given** ErrorBoundary wraps child component  
**When** child throws error  
**Then** SHALL catch error  
**And** SHALL display fallback UI  
**And** SHALL log error details

#### Scenario: Test UpdateNotification

**Given** update is available  
**When** UpdateNotification renders  
**Then** SHALL display update version  
**And** SHALL show "Install" and "Later" buttons  
**And** SHALL call handlers on button click

#### Scenario: Test component user interactions

**Given** component has interactive elements  
**When** user clicks button  
**Then** SHALL call appropriate handler  
**And** SHALL update component state  
**And** SHALL re-render with new state

### Requirement: Test Utility Functions

The system SHALL provide comprehensive tests for utility functions achieving 100% coverage.

#### Scenario: Test cn() utility

**Given** cn() merges classNames  
**When** called with multiple arguments  
**Then** SHALL merge all className strings  
**And** SHALL handle conditional classes  
**And** SHALL filter falsy values

### Requirement: Coverage Reporting

The system SHALL generate detailed coverage reports.

#### Scenario: Display coverage summary in terminal

**Given** tests run with coverage  
**When** tests complete  
**Then** SHALL display coverage percentages in terminal  
**And** SHALL highlight uncovered files in red  
**And** SHALL show total coverage across all files

#### Scenario: Generate HTML coverage report

**Given** tests run with coverage  
**When** reports are generated  
**Then** SHALL create `coverage/index.html`  
**And** SHALL show file-by-file coverage  
**And** SHALL highlight uncovered lines in red  
**And** SHALL be openable in browser

#### Scenario: Fail CI if coverage below threshold

**Given** coverage threshold is set to 80%  
**When** tests run in CI  
**Then** SHALL fail if any metric is below threshold  
**And** SHALL display which files need more coverage  
**And** SHALL exit with non-zero code

### Requirement: Test Isolation

The system SHALL ensure tests are properly isolated and don't affect each other.

#### Scenario: Reset mocks between tests

**Given** multiple tests use same mock  
**When** each test starts  
**Then** mock call history SHALL be cleared  
**And** mock return values SHALL be reset  
**And** SHALL not leak state

#### Scenario: Independent test execution

**Given** tests can run in any order  
**When** tests execute  
**Then** test order SHALL not affect results  
**And** each test SHALL start with clean state  
**And** parallel execution SHALL not cause conflicts

### Requirement: Test Debugging

The system SHALL provide tools for debugging failing tests.

#### Scenario: Run single test file

**Given** one test file is failing  
**When** developer runs `npm test -- window-manager.test.js`  
**Then** SHALL run only that file  
**And** SHALL show detailed output  
**And** SHALL allow faster iteration

#### Scenario: Use console.log in tests

**Given** developer needs to debug test  
**When** console.log() is used in test  
**Then** output SHALL appear in terminal  
**And** SHALL not be suppressed  
**And** SHALL help identify issues

#### Scenario: Inspect mock calls

**Given** test expects mock to be called  
**When** test fails  
**Then** SHALL show mock call history  
**And** SHALL show expected vs actual calls  
**And** SHALL help diagnose the issue
