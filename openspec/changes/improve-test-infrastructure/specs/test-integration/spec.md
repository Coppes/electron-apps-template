# Spec: Integration Tests

## ADDED Requirements

### Requirement: Test IPC Communication Flow

The system SHALL test end-to-end IPC communication between main and renderer processes.

#### Scenario: Test successful IPC request-response

**Given** IPC handlers are registered  
**When** renderer invokes 'SET_TITLE' with valid payload  
**Then** handler SHALL receive the payload  
**And** SHALL process the request  
**And** SHALL return success response to renderer

#### Scenario: Test IPC schema validation

**Given** IPC schemas are defined  
**When** renderer sends payload with invalid type  
**Then** validator SHALL reject the payload  
**And** SHALL NOT execute handler  
**And** SHALL return validation error to renderer

#### Scenario: Test IPC timeout handling

**Given** handler takes longer than timeout  
**When** renderer waits for response  
**Then** SHALL timeout after configured duration  
**And** SHALL reject Promise with timeout error  
**And** SHALL not leave handler hanging

#### Scenario: Test IPC error propagation

**Given** handler throws error  
**When** renderer invokes the channel  
**Then** error SHALL be caught in main process  
**And** error message SHALL be sent back to renderer  
**And** renderer Promise SHALL reject with error

### Requirement: Test Window Lifecycle Integration

The system SHALL test complete window lifecycle including creation, state management, and cleanup.

#### Scenario: Test window creation and ready event

**Given** app is ready  
**When** window-manager creates main window  
**Then** window SHALL be created with correct options  
**And** window SHALL load index.html  
**And** 'ready-to-show' event SHALL fire  
**And** window SHALL become visible

#### Scenario: Test window state save on close

**Given** window has been moved and resized  
**When** user closes the window  
**Then** 'close' event SHALL fire  
**And** current position and size SHALL be captured  
**And** state SHALL persist to electron-store  
**And** SHALL be available for next launch

#### Scenario: Test window state restore on relaunch

**Given** window state was saved previously  
**When** app relaunches and creates window  
**Then** SHALL read saved state from store  
**And** SHALL apply saved position and size  
**And** SHALL restore maximized state if applicable  
**And** window SHALL appear in last position

#### Scenario: Test multi-window coordination

**Given** multiple windows are open  
**When** main window is closed  
**Then** other windows SHALL remain open  
**And** app SHALL not quit automatically  
**And** closing all windows SHALL trigger quit

### Requirement: Test Security Integration

The system SHALL test that security features work together correctly.

#### Scenario: Test CSP blocks unauthorized scripts

**Given** CSP is applied to window  
**When** page attempts to load external script  
**Then** CSP SHALL block the script  
**And** 'csp-violation' event SHALL fire  
**And** violation SHALL be logged to audit log

#### Scenario: Test navigation guard prevents external navigation

**Given** navigation guard is active  
**When** page attempts to navigate to external URL  
**Then** 'will-navigate' SHALL be intercepted  
**And** navigation SHALL be prevented  
**And** security event SHALL be logged

#### Scenario: Test permission request flow

**Given** page requests media permission  
**When** permission handler receives request  
**Then** SHALL check allowlist  
**And** SHALL show dialog if allowed  
**And** SHALL log permission request  
**And** SHALL return user's choice

#### Scenario: Test combined security enforcement

**Given** all security features are enabled  
**When** malicious page tries multiple attack vectors  
**Then** CSP SHALL block inline scripts  
**And** navigation guard SHALL block redirects  
**And** permission handler SHALL deny dangerous permissions  
**And** all attempts SHALL be logged

### Requirement: Test Main-Renderer Data Flow

The system SHALL test data flow between main and renderer processes.

#### Scenario: Test renderer reads data via IPC

**Given** main process has data in store  
**When** renderer invokes STORE_GET  
**Then** main SHALL read from electron-store  
**And** SHALL return value to renderer  
**And** renderer SHALL receive the data

#### Scenario: Test renderer writes data via IPC

**Given** renderer has data to persist  
**When** renderer invokes STORE_SET with key and value  
**Then** main SHALL validate payload  
**And** SHALL write to electron-store  
**And** SHALL confirm success to renderer

#### Scenario: Test renderer receives events from main

**Given** renderer is listening for update events  
**When** main emits 'update-available'  
**Then** event SHALL be sent to renderer  
**And** renderer callback SHALL be invoked  
**And** SHALL include update info

#### Scenario: Test bi-directional communication

**Given** main and renderer need to communicate  
**When** renderer sends request and main sends event  
**Then** both directions SHALL work correctly  
**And** SHALL not interfere with each other  
**And** message order SHALL be preserved

### Requirement: Test Update Flow Integration

The system SHALL test auto-update flow from check to install.

#### Scenario: Test update check triggers correctly

**Given** app is running and online  
**When** update check interval elapses  
**Then** updater SHALL check for updates  
**And** SHALL emit appropriate event  
**And** renderer SHALL be notified

#### Scenario: Test update download and progress

**Given** update is available  
**When** download starts  
**Then** progress events SHALL be emitted  
**And** renderer SHALL receive progress updates  
**And** progress percentage SHALL increase  
**And** SHALL complete at 100%

#### Scenario: Test update ready to install

**Given** update is downloaded  
**When** 'update-downloaded' event fires  
**Then** renderer SHALL show "Install Now" UI  
**And** SHALL include release notes  
**And** SHALL allow user to defer

### Requirement: Test Error Handling Integration

The system SHALL test error handling across process boundaries.

#### Scenario: Test main process error reaches renderer

**Given** main process encounters error  
**When** error occurs in IPC handler  
**Then** error SHALL be caught  
**And** error message SHALL be sent to renderer  
**And** renderer SHALL display user-friendly message

#### Scenario: Test renderer error is logged

**Given** renderer process encounters error  
**When** React component throws error  
**Then** ErrorBoundary SHALL catch it  
**And** SHALL display fallback UI  
**And** error SHALL be logged to main process

#### Scenario: Test unhandled rejection handling

**Given** Promise rejection is not caught  
**When** unhandled rejection occurs  
**Then** SHALL be caught by global handler  
**And** SHALL be logged with context  
**And** app SHALL remain stable

### Requirement: Test Context Isolation Integrity

The system SHALL verify context isolation is maintained.

#### Scenario: Test renderer cannot access Node.js APIs directly

**Given** context isolation is enabled  
**When** renderer tries to access require()  
**Then** SHALL be undefined  
**And** SHALL not have access to fs, path, etc.  
**And** SHALL only access electronAPI via contextBridge

#### Scenario: Test contextBridge exposes only safe APIs

**Given** preload script uses contextBridge  
**When** renderer accesses window.electronAPI  
**Then** SHALL only have exposed methods  
**And** SHALL not have access to Electron internals  
**And** SHALL not be able to escape sandbox

#### Scenario: Test IPC is only channel for privileged operations

**Given** renderer needs to read file  
**When** attempts direct file access  
**Then** SHALL fail (no fs module)  
**And** SHALL succeed via electronAPI.openFile()  
**And** main process SHALL perform actual file I/O

### Requirement: Test Store Persistence Integration

The system SHALL test data persists correctly across app restarts.

#### Scenario: Test data survives app restart

**Given** data is stored via IPC  
**When** app closes and reopens  
**Then** data SHALL still be accessible  
**And** SHALL be readable via STORE_GET  
**And** values SHALL match what was stored

#### Scenario: Test multiple windows share store

**Given** multiple windows are open  
**When** one window writes to store  
**Then** other windows SHALL see updated value  
**And** SHALL receive change event  
**And** UI SHALL update accordingly

### Requirement: Test Lifecycle Hooks Integration

The system SHALL test that lifecycle hooks execute correctly.

#### Scenario: Test before-quit hook saves state

**Given** app is about to quit  
**When** 'before-quit' event fires  
**Then** SHALL save all window states  
**And** SHALL save application state  
**And** SHALL wait for save to complete  
**And** SHALL then proceed with quit

#### Scenario: Test activate hook (macOS)

**Given** app is running on macOS without windows  
**When** dock icon is clicked  
**Then** 'activate' event SHALL fire  
**And** SHALL recreate main window  
**And** window SHALL be focused

### Requirement: Test Performance Under Load

The system SHALL test system behavior under realistic load.

#### Scenario: Test many concurrent IPC calls

**Given** renderer makes 100 IPC calls rapidly  
**When** all calls execute  
**Then** SHALL handle all calls without dropping any  
**And** SHALL maintain correct order where needed  
**And** SHALL not crash or hang

#### Scenario: Test large data transfer via IPC

**Given** renderer needs to send 10MB of data  
**When** data is sent via IPC  
**Then** SHALL transfer successfully  
**And** SHALL not block UI  
**And** SHALL not cause memory issues
