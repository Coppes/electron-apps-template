## MODIFIED Requirements

### Requirement: Enforce Sandbox in Main Window
The `webPreferences.sandbox` option MUST be explicitly set to `true` when creating the main window to ensure the renderer process runs in a sandboxed environment, preventing unauthorized access to Node.js APIs.

#### Scenario: Enforce Sandbox
- **GIVEN** the application is starting
- **WHEN** the main window is created via `WindowManager`
- **THEN** the `webPreferences.sandbox` option MUST be set to `true`
- **AND** the application MUST continue to function correctly (preload loading)

### Requirement: Preload Compatibility
The preload script MUST be compatible with a sandboxed environment, exposing APIs only via `contextBridge` and avoiding legacy Node.js integration patterns that break in the sandbox.

#### Scenario: Preload Script Execution
- **GIVEN** sandbox is enabled
- **WHEN** the preload script executes
- **THEN** it MUST NOT use forbidden Node.js APIs directly
- **AND** it MUST successfully expose APIs via `contextBridge`
