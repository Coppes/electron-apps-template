# Spec: End-to-End Tests

## ADDED Requirements

### Requirement: E2E Test Infrastructure with Playwright

The system SHALL use Playwright for Electron to test complete application flows.

#### Scenario: Launch Electron app for testing

**Given** E2E test is starting  
**When** test launches the app  
**Then** Electron process SHALL start  
**And** main window SHALL appear  
**And** SHALL be controllable via Playwright

#### Scenario: Access first window

**Given** app has launched  
**When** test calls app.firstWindow()  
**Then** SHALL return BrowserWindow reference  
**And** SHALL be able to interact with window  
**And** SHALL access page content

#### Scenario: Close app after test

**Given** test has completed  
**When** app.close() is called  
**Then** app SHALL terminate cleanly  
**And** all windows SHALL close  
**And** SHALL not leave orphaned processes

### Requirement: Test Application Launch

The system SHALL test that application launches successfully.

#### Scenario: App launches without errors

**Given** app is packaged correctly  
**When** E2E test launches app  
**Then** app SHALL start without crashes  
**And** main window SHALL appear within 5 seconds  
**And** console SHALL not show critical errors

#### Scenario: App shows correct title

**Given** app has launched  
**When** main window is visible  
**Then** window title SHALL be "Electron App"  
**And** SHALL match configured title

#### Scenario: App loads UI correctly

**Given** app has launched  
**When** main window content loads  
**Then** SHALL display "Welcome to Electron Apps Template"  
**And** SHALL show navigation buttons  
**And** SHALL render React components

### Requirement: Test Window Management

The system SHALL test window operations end-to-end.

#### Scenario: Minimize window

**Given** main window is open and focused  
**When** minimize button is clicked  
**Then** window SHALL minimize to taskbar  
**And** isMinimized() SHALL return true

#### Scenario: Maximize window

**Given** main window is at default size  
**When** maximize button is clicked  
**Then** window SHALL fill screen  
**And** isMaximized() SHALL return true

#### Scenario: Restore window from maximized

**Given** window is maximized  
**When** restore button is clicked  
**Then** window SHALL return to previous size  
**And** isMaximized() SHALL return false

#### Scenario: Close window

**Given** window is open  
**When** close button is clicked  
**Then** window SHALL close  
**And** app SHALL quit (if last window)  
**And** window state SHALL be saved

#### Scenario: Create multiple windows

**Given** main window is open  
**When** user triggers "New Window" action  
**Then** second window SHALL open  
**And** both windows SHALL be functional  
**And** focus SHALL switch to new window

#### Scenario: Window state persistence

**Given** window is moved and resized  
**When** app closes and reopens  
**Then** window SHALL restore to saved position  
**And** SHALL restore saved size  
**And** SHALL restore maximized state if applicable

### Requirement: Test User Interactions

The system SHALL test complete user interaction flows.

#### Scenario: Navigate between pages

**Given** app is on home page  
**When** user clicks "Demo" navigation button  
**Then** Demo page SHALL be displayed  
**And** URL/state SHALL update  
**And** navigation SHALL be smooth

#### Scenario: Interact with Demo component

**Given** Demo page is visible  
**When** user types in input field  
**Then** input SHALL update in real-time  
**And** counter SHALL increment on button click  
**And** UI SHALL respond immediately

#### Scenario: Open file dialog

**Given** user needs to select a file  
**When** user clicks "Open File" button  
**Then** native file dialog SHALL appear  
**And** SHALL allow file selection  
**And** selected file path SHALL display in UI

#### Scenario: Use keyboard shortcuts

**Given** app has keyboard shortcuts defined  
**When** user presses Ctrl+O (or Cmd+O on macOS)  
**Then** file dialog SHALL open  
**And** shortcuts SHALL work consistently

### Requirement: Test Auto-Update Flow

The system SHALL test auto-update functionality end-to-end.

#### Scenario: Check for updates

**Given** app is running  
**When** update check is triggered  
**Then** SHALL query update server (or mock)  
**And** SHALL display result in UI  
**And** SHALL not disrupt user workflow

#### Scenario: Download update

**Given** update is available  
**When** user accepts update  
**Then** download SHALL start  
**And** progress bar SHALL appear  
**And** percentage SHALL increase from 0% to 100%

#### Scenario: Install update notification

**Given** update is downloaded  
**When** download completes  
**Then** "Update Ready" notification SHALL appear  
**And** SHALL show "Install Now" and "Later" buttons  
**And** SHALL include release notes

#### Scenario: Install update

**Given** update is ready to install  
**When** user clicks "Install Now"  
**Then** app SHALL save state  
**And** SHALL quit and install update  
**And** SHALL relaunch automatically

#### Scenario: Defer update

**Given** update notification is shown  
**When** user clicks "Remind Me Later"  
**Then** notification SHALL dismiss  
**And** app SHALL continue normally  
**And** SHALL remind later

### Requirement: Test Security Features

The system SHALL test security enforcement end-to-end.

#### Scenario: Block external navigation

**Given** page has link to external site  
**When** user clicks external link  
**Then** link SHALL NOT navigate in app  
**And** SHALL open in default browser  
**And** app SHALL remain secure

#### Scenario: Context isolation enforced

**Given** renderer page is loaded  
**When** console tries to access require()  
**Then** SHALL return undefined  
**And** SHALL not have Node.js access  
**And** SHALL only use electronAPI

#### Scenario: Permission request denied

**Given** page requests dangerous permission  
**When** permission request occurs  
**Then** SHALL be automatically denied  
**And** SHALL log security event  
**And** SHALL not show user prompt

### Requirement: Test Error Handling

The system SHALL test error handling and recovery.

#### Scenario: Component error shows fallback UI

**Given** component is about to throw error  
**When** error occurs  
**Then** ErrorBoundary SHALL catch it  
**And** SHALL display fallback UI  
**And** app SHALL remain functional

#### Scenario: IPC error displays user-friendly message

**Given** IPC call will fail  
**When** error occurs  
**Then** error message SHALL display to user  
**And** SHALL be understandable  
**And** SHALL not show stack trace

#### Scenario: Recover from network error

**Given** app is offline  
**When** user triggers online-only action  
**Then** SHALL display offline message  
**And** SHALL retry when connection restored  
**And** SHALL not crash

### Requirement: Test Data Persistence

The system SHALL test data persists correctly.

#### Scenario: Store data and retrieve after restart

**Given** user enters data in app  
**When** data is saved  
**Then** SHALL persist to electron-store  
**And** SHALL survive app restart  
**And** SHALL be visible after relaunch

#### Scenario: Multiple windows share data

**Given** two windows are open  
**When** one window updates data  
**Then** other window SHALL see update  
**And** SHALL reflect change immediately

### Requirement: Test Platform-Specific Features

The system SHALL test features vary correctly by platform.

#### Scenario: macOS menu bar

**Given** app runs on macOS  
**When** app launches  
**Then** SHALL have menu bar at top of screen  
**And** SHALL include app-specific menus

#### Scenario: Windows tray icon

**Given** app runs on Windows  
**When** window minimizes  
**Then** SHALL show icon in system tray  
**And** SHALL allow restore from tray

#### Scenario: Linux desktop integration

**Given** app runs on Linux  
**When** app is installed  
**Then** SHALL appear in app launcher  
**And** SHALL use correct icon

### Requirement: Test Performance

The system SHALL test app performs acceptably.

#### Scenario: App starts quickly

**Given** app is launched  
**When** timing startup  
**Then** SHALL show window within 3 seconds  
**And** SHALL be interactive within 5 seconds

#### Scenario: Navigation is smooth

**Given** app is running  
**When** user navigates between pages  
**Then** page transitions SHALL be < 200ms  
**And** SHALL feel instant to user

#### Scenario: Memory usage stays reasonable

**Given** app has been running for 10 minutes  
**When** checking memory usage  
**Then** SHALL use < 200MB of RAM  
**And** SHALL not continuously grow

### Requirement: Test Accessibility

The system SHALL test basic accessibility works.

#### Scenario: Keyboard navigation

**Given** user cannot use mouse  
**When** user uses Tab key  
**Then** focus SHALL move through interactive elements  
**And** focused element SHALL be visible

#### Scenario: Screen reader support

**Given** screen reader is enabled  
**When** user navigates the UI  
**Then** elements SHALL have proper labels  
**And** actions SHALL be announced

### Requirement: E2E Test Debugging

The system SHALL provide debugging tools for E2E tests.

#### Scenario: Capture screenshot on failure

**Given** E2E test fails  
**When** failure occurs  
**Then** screenshot SHALL be saved  
**And** SHALL be stored in test-results/  
**And** SHALL help diagnose issue

#### Scenario: Capture trace on failure

**Given** test fails  
**When** failure is detected  
**Then** Playwright trace SHALL be saved  
**And** SHALL include network requests, console logs  
**And** SHALL be viewable in Playwright Inspector

#### Scenario: Console logs available

**Given** E2E test is running  
**When** app logs to console  
**Then** logs SHALL be captured  
**And** SHALL be available in test output  
**And** SHALL help debug issues

### Requirement: E2E Test Isolation

The system SHALL ensure E2E tests don't interfere with each other.

#### Scenario: Fresh app instance per test

**Given** multiple E2E tests run  
**When** each test starts  
**Then** SHALL launch fresh app instance  
**And** SHALL have clean state  
**And** SHALL not share data with previous test

#### Scenario: Clean up after test

**Given** test has completed  
**When** cleanup runs  
**Then** app SHALL terminate  
**And** temp files SHALL be deleted  
**And** SHALL not leave artifacts
