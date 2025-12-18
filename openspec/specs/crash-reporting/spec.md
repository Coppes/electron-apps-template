# crash-reporting Specification

## Purpose
TBD - created by archiving change add-observability-maintenance. Update Purpose after archive.
## Requirements
### Requirement: Crash Reporting Initialization

The application MUST support optional crash reporting integration that can be enabled via configuration.

#### Scenario: Initialize Crash Reporting (Enabled)

**Given** `config.crashReporting.enabled` is `true`

**And** `config.crashReporting.dsn` is configured with a valid endpoint

**When** the application starts

**Then** the crash reporting SDK MUST be initialized

**And** the initialization MUST include:
- Application name and version as release identifier
- Environment (development, staging, production)
- Platform information (OS, architecture)

**And** a log entry MUST confirm: "Crash reporting initialized"

**Verification**: Set config, start app, verify initialization log

#### Scenario: Skip Initialization (Disabled)

**Given** `config.crashReporting.enabled` is `false`

**When** the application starts

**Then** the crash reporting SDK MUST NOT be initialized

**And** no network requests MUST be made to crash reporting service

**And** a log entry MUST confirm: "Crash reporting disabled"

**Verification**: Set enabled to false, verify no network calls

#### Scenario: Graceful Failure on Invalid Config

**Given** `config.crashReporting.enabled` is `true`

**And** `config.crashReporting.dsn` is empty or invalid

**When** crash reporting attempts to initialize

**Then** the initialization MUST fail gracefully without crashing the app

**And** an error log MUST be written: "Failed to initialize crash reporting"

**And** the application MUST continue running normally

**Verification**: Provide invalid DSN, verify app doesn't crash

### Requirement: Main Process Crash Capture

The crash reporting system MUST capture and report uncaught exceptions and unhandled rejections from the main process.

#### Scenario: Capture Uncaught Exception

**Given** crash reporting is enabled

**When** an uncaught exception occurs in the main process

**Then** the exception MUST be captured and sent to the crash reporting service

**And** the report MUST include:
- Error message
- Stack trace
- Application version
- Platform information (OS, Node version, Electron version)
- Timestamp

**And** the error MUST also be logged locally via `logger.error()`

**Verification**: Throw uncaught exception, verify report sent and logged

#### Scenario: Capture Unhandled Promise Rejection

**Given** crash reporting is enabled

**When** an unhandled promise rejection occurs in the main process

**Then** the rejection MUST be captured and reported

**And** the report MUST include rejection reason and promise context

**Verification**: Trigger unhandled rejection, verify report

#### Scenario: Enrich with Diagnostics

**Given** a crash occurs in the main process

**When** the crash report is being prepared

**Then** the report MUST include diagnostic data from `getDiagnostics()`:
- Memory usage (RSS, heap)
- Application uptime
- System version
- Locale

**Verification**: Check crash report contains diagnostics

### Requirement: Renderer Process Crash Capture

The crash reporting system MUST capture crashes and errors from renderer processes.

#### Scenario: Capture Renderer Crash

**Given** crash reporting is enabled

**When** a renderer process crashes (render-process-gone event)

**Then** the crash MUST be reported with:
- Crash reason (e.g., "crashed", "killed", "oom")
- Exit code
- Window ID
- URL of the crashed page

**And** the crash MUST be tagged with `process: renderer`

**Verification**: Trigger renderer crash, verify report with renderer tag

#### Scenario: Capture JavaScript Errors in Renderer

**Given** crash reporting is enabled in renderer

**When** a JavaScript error occurs in renderer and is not caught

**Then** the error MUST be captured and reported

**And** the report MUST include:
- Error message and stack trace
- Component stack (React component trace if available)
- URL or route where error occurred
- User actions leading to error (breadcrumbs)

**Verification**: Throw error in React component, verify report

### Requirement: Privacy and Data Sanitization

Crash reports MUST be sanitized to remove sensitive user data before transmission.

#### Scenario: Strip File Paths

**Given** a crash report contains local file paths

**When** the report is prepared for transmission

**Then** absolute file paths MUST be sanitized to remove:
- Username from paths (e.g., `/Users/john` → `/Users/[user]`)
- Home directory paths
- Custom installation paths

**And** relative paths within the application MUST be preserved

**Verification**: Trigger crash with file path, verify sanitized path in report

#### Scenario: Redact Environment Variables

**Given** a crash report includes environment variables

**When** the report is prepared

**Then** sensitive environment variables MUST be redacted:
- API keys, tokens, passwords
- DSN URLs containing secrets
- Any variable matching pattern `*_SECRET`, `*_KEY`, `*_TOKEN`

**Verification**: Set sensitive env vars, verify redacted in report

#### Scenario: PII Protection

**Given** crash reporting is capturing data

**When** any data might contain PII (personally identifiable information)

**Then** the system MUST NOT include:
- User input from form fields
- Clipboard contents
- Screenshots (unless explicitly enabled)
- Cookie values
- Local storage data

**Verification**: Ensure no PII in captured crash reports

### Requirement: User Consent and Control

Users MUST have control over crash reporting and be informed about data collection.

#### Scenario: Opt-In Configuration

**Given** crash reporting is disabled by default

**When** a user wants to enable crash reporting

**Then** they MUST explicitly set `config.crashReporting.enabled = true`

**And** the application SHOULD provide a settings UI toggle

**And** the user SHOULD be informed what data is collected

**Verification**: Default config has enabled: false

#### Scenario: Disable at Runtime

**Given** crash reporting is currently enabled

**When** `config.crashReporting.enabled` is set to `false`

**Then** the crash reporting SDK MUST stop capturing events

**And** no further crash reports MUST be sent

**And** the change MUST take effect without requiring app restart

**Verification**: Toggle config, verify reporting stops

### Requirement: Crash Report Context

Crash reports MUST include contextual information to aid debugging.

#### Scenario: Release Tracking

**Given** crash reporting is enabled

**When** a crash report is sent

**Then** the report MUST include a release identifier formatted as:
```
{appName}@{version}
```

**Example**: `electron-apps-template@1.2.3`

**Verification**: Check crash report contains correct release tag

#### Scenario: Environment Tagging

**Given** crash reporting is enabled

**When** a crash report is sent

**Then** the report MUST include an environment tag:
- `development` when running in dev mode
- `staging` when running in staging
- `production` when running packaged production build

**Verification**: Verify environment tag matches runtime mode

#### Scenario: Custom Context

**Given** an error occurs with additional context

**When** the error is reported using `reportError(error, context)`

**Then** the custom context MUST be included in the crash report

**And** the context MUST be searchable in the crash reporting dashboard

**Example**: `reportError(error, { feature: 'file-import', userId: 'user123' })`

**Verification**: Report error with context, verify context in dashboard

### Requirement: Breadcrumb Tracking

The crash reporting system MUST track user actions as breadcrumbs to provide context for crashes.

#### Scenario: Automatic Breadcrumbs

**Given** crash reporting is enabled

**When** significant application events occur:
- Window created/closed
- Navigation events
- IPC calls
- User interactions (button clicks, form submits)

**Then** these events MUST be recorded as breadcrumbs

**And** breadcrumbs MUST be included in crash reports

**And** breadcrumbs MUST be limited to last 50 events

**Verification**: Perform actions, trigger crash, verify breadcrumbs in report

#### Scenario: Manual Breadcrumbs

**Given** crash reporting is enabled

**When** the application logs important events using `addBreadcrumb()`

**Then** the breadcrumbs MUST be added to the crash context

**Example**:
```javascript
addBreadcrumb({
  category: 'user-action',
  message: 'User exported file',
  level: 'info',
  data: { filename: 'export.csv' }
});
```

**Verification**: Add custom breadcrumbs, verify in crash report

### Requirement: Performance Monitoring

The crash reporting system MUST support optional performance monitoring for production apps.

#### Scenario: Transaction Tracking

**Given** performance monitoring is enabled in configuration

**When** long-running operations occur (e.g., file processing, API calls)

**Then** the duration MUST be tracked as a transaction

**And** slow transactions MUST be reported to the monitoring service

**Verification**: Execute slow operation, verify performance report

### Requirement: Local Fallback

When crash reporting service is unavailable, crashes MUST still be logged locally.

#### Scenario: Network Failure Fallback

**Given** crash reporting is enabled

**And** the crash reporting service is unreachable

**When** a crash occurs

**Then** the crash MUST be logged locally via `logger.error()`

**And** the application MUST NOT hang or fail due to network timeout

**And** a warning MUST be logged: "Failed to send crash report"

**Verification**: Disconnect network, trigger crash, verify local log

