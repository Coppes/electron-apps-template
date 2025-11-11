# Security Hardening Specification

## ADDED Requirements

### Requirement: Content Security Policy (CSP) Enforcement
The system SHALL enforce a strict Content Security Policy on all windows to prevent injection attacks and unauthorized resource loading.

#### Scenario: Apply CSP to production windows
- **WHEN** a window is created in production mode
- **THEN** a CSP header is set with 'default-src' set to 'self'
- **AND** 'script-src' is restricted to 'self'
- **AND** 'style-src' allows 'self' and 'unsafe-inline' (for Tailwind)
- **AND** 'img-src' allows 'self' and 'data:' URIs
- **AND** 'connect-src' is restricted to 'self'

#### Scenario: Relax CSP in development for hot reload
- **WHEN** a window is created in development mode
- **THEN** CSP is relaxed to allow localhost connections
- **AND** webpack-dev-server connections are permitted
- **AND** eval is allowed for source maps (development only)
- **AND** the relaxed policy is logged as a warning

#### Scenario: Block inline scripts without nonce
- **WHEN** the renderer attempts to execute an inline script without a nonce
- **THEN** the CSP blocks the script execution
- **AND** a CSP violation report is logged
- **AND** the violation is visible in DevTools console

### Requirement: Context Isolation Enforcement
The system SHALL enforce context isolation on all BrowserWindow instances to prevent renderer access to Node.js APIs.

#### Scenario: Create window with context isolation enabled
- **WHEN** any window is created
- **THEN** contextIsolation is set to true in webPreferences
- **AND** nodeIntegration is set to false
- **AND** enableRemoteModule is set to false (deprecated module)
- **AND** sandbox is set to true where possible

#### Scenario: Verify renderer cannot access Node.js
- **WHEN** renderer code attempts to use 'require' or 'process'
- **THEN** the access is denied
- **AND** the renderer only has access to web APIs
- **AND** access to electron APIs is only via contextBridge

#### Scenario: Expose safe APIs via contextBridge
- **WHEN** the preload script runs
- **THEN** APIs are exposed using contextBridge.exposeInMainWorld
- **AND** only explicitly defined methods are accessible
- **AND** no Node.js or Electron internal APIs are exposed

### Requirement: Navigation Security Guards
The system SHALL prevent unauthorized navigation to external URLs and enforce allowed origins for all navigation events.

#### Scenario: Block navigation to external URLs
- **WHEN** the renderer attempts to navigate to an external URL
- **THEN** the 'will-navigate' event is intercepted
- **AND** the URL is checked against an allowlist
- **AND** if not allowed, navigation is prevented
- **AND** the blocked navigation is logged

#### Scenario: Block new window creation for untrusted URLs
- **WHEN** the renderer attempts to open a new window (window.open, target="_blank")
- **THEN** the 'setWindowOpenHandler' intercepts the request
- **AND** the URL is validated against security policies
- **AND** untrusted URLs are denied
- **AND** trusted URLs (if any) are allowed

#### Scenario: Allow localhost navigation in development
- **WHEN** in development mode and navigating to localhost URLs
- **THEN** localhost origins are added to the allowlist
- **AND** navigation to localhost is permitted
- **AND** the development-mode allowlist is logged

### Requirement: External Link Handling
The system SHALL open external links in the default browser rather than within the Electron application.

#### Scenario: Open external link in default browser
- **WHEN** a user clicks a link with an external URL
- **THEN** the link is opened in the system's default browser
- **AND** navigation within the Electron app is prevented
- **AND** the opened URL is logged for audit purposes

#### Scenario: Handle malformed or suspicious URLs
- **WHEN** attempting to open a malformed or suspicious URL
- **THEN** the URL is rejected and not opened
- **AND** a security warning is logged
- **AND** the user is notified if appropriate

### Requirement: Secure Webview Usage Guidelines
The system SHALL provide secure webview configuration patterns and discourage webview usage where alternatives exist.

#### Scenario: Configure secure webview when necessary
- **WHEN** a webview is absolutely required
- **THEN** contextIsolation is enabled on the webview
- **AND** nodeIntegration is disabled
- **AND** allowpopups is disabled
- **AND** a restrictive CSP is applied to the webview

#### Scenario: Document webview security risks
- **WHEN** reviewing the codebase or documentation
- **THEN** webview security risks are clearly documented
- **AND** alternatives to webview are recommended (BrowserView, BrowserWindow)
- **AND** examples show secure webview configuration if needed

### Requirement: Permission Management

The system SHALL explicitly handle permission requests (camera, microphone, notifications) with user consent and logging.

#### Scenario: Handle permission request with user prompt

- **WHEN** the renderer requests a permission (e.g., camera)
- **THEN** the session's `setPermissionRequestHandler` intercepts the request
- **AND** a dialog prompts the user to allow or deny
- **AND** the user's choice is respected
- **AND** the permission request and response are logged

#### Scenario: Auto-deny unexpected permissions

- **WHEN** a permission request is made for an unexpected permission type
- **THEN** the permission is automatically denied
- **AND** the denial is logged with the requested permission type
- **AND** the user is not prompted unnecessarily

#### Scenario: Configure allowed permissions per app

- **GIVEN** the application has defined required permissions in config
- **WHEN** a permission is requested
- **THEN** the permission type is checked against the allowed list
- **AND** if in the allowed list, the user is prompted
- **AND** if not in the allowed list, the permission is auto-denied
- **AND** all decisions are logged with timestamp and origin

#### Scenario: Deny all permissions by default

- **GIVEN** no permissions are explicitly configured as allowed
- **WHEN** any permission request is received
- **THEN** the permission is denied by default
- **AND** the denial is logged
- **AND** the user is not prompted

#### Scenario: Handle permission revocation

- **WHEN** the user revokes a previously granted permission
- **THEN** the permission status is updated
- **AND** the renderer is notified of the revocation (if subscribed)
- **AND** subsequent requests for that permission require new consent
- **AND** the revocation is logged

### Requirement: Security Audit Logging
The system SHALL log all security-relevant events for audit and monitoring purposes.

#### Scenario: Log CSP violations
- **WHEN** a CSP violation occurs
- **THEN** the violation details are logged (violated directive, blocked URI)
- **AND** the timestamp and window ID are included
- **AND** violations are written to a security audit log file

#### Scenario: Log navigation blocks
- **WHEN** a navigation attempt is blocked
- **THEN** the blocked URL is logged
- **AND** the reason for blocking is included
- **AND** the source window is identified

#### Scenario: Log permission requests and responses
- **WHEN** a permission is requested
- **THEN** the permission type and requesting origin are logged
- **AND** the user's response (allow/deny) is logged
- **AND** the log includes timestamp and window context
