# Spec: Test Mocks and Fixtures

## ADDED Requirements

### Requirement: Comprehensive Electron API Mocks

The system SHALL provide complete mocks for all Electron APIs used in the application.

#### Scenario: Mock BrowserWindow

**Given** tests need to simulate window operations  
**When** BrowserWindow mock is used  
**Then** the constructor SHALL return a mockable window instance  
**And** SHALL provide static methods (getAllWindows, fromId, getFocusedWindow)  
**And** SHALL provide instance methods (close, minimize, maximize, loadURL, webContents)  
**And** all methods SHALL be vi.fn() for call tracking

#### Scenario: Mock app module

**Given** tests need to simulate app lifecycle  
**When** app mock is used  
**Then** SHALL provide getPath() returning mock paths  
**And** SHALL provide getVersion() returning mock version  
**And** SHALL provide quit(), relaunch(), on(), whenReady()  
**And** all methods SHALL be trackable vi.fn()

#### Scenario: Mock dialog module

**Given** tests need to simulate file dialogs  
**When** dialog mock is used  
**Then** showOpenDialog SHALL return { canceled: false, filePaths: [] }  
**And** showSaveDialog SHALL return { canceled: false, filePath: '' }  
**And** showMessageBox SHALL return { response: 0 }  
**And** all methods SHALL be async and return Promises

#### Scenario: Mock ipcMain module

**Given** tests need to simulate IPC handlers  
**When** ipcMain mock is used  
**Then** handle() SHALL register mock handlers  
**And** on() SHALL register mock event listeners  
**And** removeHandler() SHALL remove handlers  
**And** SHALL track all registrations

#### Scenario: Mock ipcRenderer module

**Given** tests need to simulate IPC from renderer  
**When** ipcRenderer mock is used  
**Then** invoke() SHALL call registered handlers  
**And** send() SHALL emit events  
**And** on() SHALL register listeners  
**And** all methods SHALL be trackable

### Requirement: Complete electronAPI Mock for Renderer

The system SHALL provide a complete mock of the contextBridge-exposed electronAPI.

#### Scenario: Mock basic IPC methods

**Given** renderer tests need electronAPI  
**When** window.electronAPI is accessed  
**Then** setTitle SHALL be a vi.fn() returning Promise  
**And** openFile SHALL be a vi.fn() returning Promise  
**And** saveFile SHALL be a vi.fn() returning Promise  
**And** all methods SHALL be callable

#### Scenario: Mock event subscription API

**Given** renderer needs to listen for events  
**When** window.electronAPI.events is accessed  
**Then** onUpdateAvailable SHALL be a vi.fn() returning cleanup function  
**And** onUpdateDownloaded SHALL be a vi.fn() returning cleanup function  
**And** onUpdateProgress SHALL be a vi.fn() returning cleanup function  
**And** onUpdateError SHALL be a vi.fn() returning cleanup function  
**And** cleanup functions SHALL be callable

#### Scenario: Mock store API

**Given** renderer needs persistent storage  
**When** window.electronAPI.store is accessed  
**Then** get() SHALL be a vi.fn()  
**And** set() SHALL be a vi.fn()  
**And** delete() SHALL be a vi.fn()  
**And** has() SHALL be a vi.fn()  
**And** all methods SHALL track calls

### Requirement: Reusable Test Fixtures

The system SHALL provide reusable fixtures for common test scenarios.

#### Scenario: Window state fixtures

**Given** tests need window state data  
**When** window fixtures are imported  
**Then** SHALL provide default window state (1200x800)  
**And** SHALL provide maximized state  
**And** SHALL provide minimized state  
**And** SHALL provide fullscreen state  
**And** all states SHALL be plain objects

#### Scenario: IPC payload fixtures

**Given** tests need IPC message data  
**When** IPC fixtures are imported  
**Then** SHALL provide valid payload for each IPC channel  
**And** SHALL provide invalid payloads for validation testing  
**And** SHALL provide edge case payloads (empty, null, undefined, large)  
**And** SHALL be grouped by channel name

#### Scenario: App state fixtures

**Given** tests need application state  
**When** app fixtures are imported  
**Then** SHALL provide initial app state  
**And** SHALL provide ready app state  
**And** SHALL provide quitting app state  
**And** SHALL provide error app state

### Requirement: Test Helper Functions

The system SHALL provide helper functions to reduce test boilerplate.

#### Scenario: Create mock window

**Given** tests need a BrowserWindow instance  
**When** createMockWindow() is called  
**Then** SHALL return a mock window with all methods  
**And** SHALL accept optional config for customization  
**And** SHALL track window in internal registry

#### Scenario: Create mock WebContents

**Given** tests need a WebContents instance  
**When** createMockWebContents() is called  
**Then** SHALL return mock with send(), on(), session, etc.  
**And** SHALL be attachable to mock window  
**And** SHALL track events and IPC calls

#### Scenario: Wait for IPC call

**Given** tests need to wait for async IPC  
**When** waitForIpc(channel) is called  
**Then** SHALL return Promise that resolves when channel is called  
**And** SHALL timeout after 5 seconds  
**And** SHALL resolve with call arguments

#### Scenario: Mock logger

**Given** tests should not spam console  
**When** mockLogger() is called  
**Then** SHALL replace logger.info, warn, error, debug with vi.fn()  
**And** SHALL be restorable  
**And** SHALL track all log calls

#### Scenario: Reset all mocks

**Given** tests need clean slate  
**When** resetAllMocks() is called  
**Then** SHALL call vi.clearAllMocks()  
**And** SHALL reset all custom mock state  
**And** SHALL clear window registry

### Requirement: Type-Safe Mock Definitions

The system SHALL provide mocks that match the actual API signatures.

#### Scenario: Verify mock signatures match real APIs

**Given** mocks are created  
**When** code uses mocked APIs  
**Then** method names SHALL match real Electron APIs  
**And** parameter counts SHALL match  
**And** return types SHALL match (Promise vs sync)  
**And** TypeScript (if added) SHALL not complain

#### Scenario: Mock returns sensible defaults

**Given** mocked methods are called  
**When** no explicit return value is set  
**Then** SHALL return sensible defaults (empty arrays, empty strings, false)  
**And** SHALL not return undefined where real API doesn't  
**And** async methods SHALL return resolved Promises

### Requirement: Mock State Management

The system SHALL allow tests to control mock behavior and inspect state.

#### Scenario: Configure mock return values

**Given** a test needs specific behavior  
**When** mock method is configured with mockReturnValue  
**Then** SHALL return configured value on next call  
**And** SHALL persist until cleared  
**And** SHALL support mockReturnValueOnce for single call

#### Scenario: Inspect mock call history

**Given** a mock method was called  
**When** test inspects call history  
**Then** SHALL provide number of calls  
**And** SHALL provide arguments for each call  
**And** SHALL provide return values  
**And** SHALL provide this context

#### Scenario: Verify mock was called

**Given** code should call a mock  
**When** test verifies the call  
**Then** expect(mock).toHaveBeenCalled() SHALL work  
**And** expect(mock).toHaveBeenCalledWith(...) SHALL work  
**And** expect(mock).toHaveBeenCalledTimes(n) SHALL work

### Requirement: Mock Cleanup and Isolation

The system SHALL ensure mocks don't leak between tests.

#### Scenario: Auto-clear mocks between tests

**Given** multiple tests use the same mocks  
**When** each test starts  
**Then** all mock call history SHALL be cleared  
**And** all mock return values SHALL be reset  
**And** SHALL not affect other tests

#### Scenario: Restore original implementations

**Given** a mock temporarily replaces real code  
**When** tests complete  
**Then** original implementation SHALL be restorable  
**And** subsequent non-test code SHALL use real implementation

### Requirement: Fixture Organization

The system SHALL organize fixtures in a discoverable structure.

#### Scenario: Group fixtures by domain

**Given** multiple fixture files exist  
**When** a developer needs fixtures  
**Then** window fixtures SHALL be in `test/fixtures/window-fixtures.js`  
**And** IPC fixtures SHALL be in `test/fixtures/ipc-fixtures.js`  
**And** app fixtures SHALL be in `test/fixtures/app-fixtures.js`  
**And** SHALL use named exports for easy discovery

#### Scenario: Export fixtures with clear names

**Given** fixtures are exported  
**When** developer imports fixtures  
**Then** names SHALL be descriptive (validSetTitlePayload, invalidPayload, etc.)  
**And** SHALL include valid and invalid variants  
**And** SHALL be documented with JSDoc

### Requirement: Mock Performance

The system SHALL ensure mocks don't slow down tests.

#### Scenario: Mocks execute synchronously when possible

**Given** real API is synchronous  
**When** mock is called  
**Then** SHALL return immediately (no setTimeout)  
**And** SHALL not introduce artificial delays  
**And** SHALL maintain test speed

#### Scenario: Lazy-load expensive mocks

**Given** some mocks are expensive to create  
**When** mocks are imported  
**Then** SHALL use lazy initialization  
**And** SHALL only create when first used  
**And** SHALL not slow down test suite startup
