# Spec: Auto-Updater

Complete auto-update flow with user notifications and configurable update behaviors.

## ADDED Requirements

### Requirement: Update Event Notifications

The auto-updater MUST emit IPC events to all renderer processes when update lifecycle events occur, enabling UI feedback and user interaction.

#### Scenario: Update Available Notification

**Given** the auto-updater detects a new version on the update server

**When** the `update-available` event fires in the main process

**Then** all open windows MUST receive an IPC message via `IPC_CHANNELS.UPDATE_AVAILABLE`

**And** the message MUST include:
- `version` (string) - The new version number
- `releaseDate` (ISO 8601 string) - When the release was published
- `releaseNotes` (string, optional) - Changelog or release notes

**Verification**: Create window, trigger update check, verify IPC event received in renderer

#### Scenario: Update Downloaded Notification

**Given** the auto-updater has successfully downloaded an update package

**When** the `update-downloaded` event fires in the main process

**Then** all open windows MUST receive an IPC message via `IPC_CHANNELS.UPDATE_DOWNLOADED`

**And** the message MUST include:
- `version` (string) - The downloaded version number
- `releaseDate` (ISO 8601 string) - Release date
- `downloadedAt` (ISO 8601 string) - When download completed

**Verification**: Mock update download, verify IPC event contains correct version

#### Scenario: Update Download Progress

**Given** an update is currently downloading

**When** the `download-progress` event fires in the main process

**Then** all open windows SHOULD receive progress updates via `IPC_CHANNELS.UPDATE_PROGRESS`

**And** the message MUST include:
- `percent` (number) - Download percentage (0-100)
- `transferred` (number) - Bytes downloaded
- `total` (number) - Total bytes

**Verification**: Mock download with progress, verify multiple progress events

#### Scenario: Update Error Notification

**Given** an error occurs during update check or download

**When** the `error` event fires in the auto-updater

**Then** all open windows MUST receive an IPC message via `IPC_CHANNELS.UPDATE_ERROR`

**And** the message MUST include:
- `message` (string) - Human-readable error message
- `code` (string, optional) - Error code for debugging

**And** the error MUST be logged with `logger.error()`

**Verification**: Trigger update error (invalid URL), verify error event and log

### Requirement: Update Installation Actions

The application MUST provide IPC handlers for user-initiated update actions, allowing renderer to control update behavior.

#### Scenario: Check for Updates on Demand

**Given** the renderer wants to manually check for updates

**When** the renderer calls `window.electronAPI.app.checkForUpdates()`

**Then** the main process MUST invoke `autoUpdater.checkForUpdates()`

**And** return a promise resolving to:
- `{ available: true, version: string }` if update found
- `{ available: false }` if no update found

**Verification**: Call API method, verify updater checks remote server

#### Scenario: Install Update and Restart

**Given** an update has been downloaded and is ready to install

**When** the renderer calls `window.electronAPI.app.installUpdate()`

**Then** the main process MUST call `autoUpdater.quitAndInstall()`

**And** the application MUST save all unsaved data before quitting

**And** the application MUST restart with the new version

**Verification**: Download update, call install, verify app restarts

### Requirement: Configurable Update Behaviors

The auto-updater MUST support multiple update strategies configurable via `config.js`.

#### Scenario: Silent Auto-Download

**Given** `config.updates.autoDownload` is `true`

**When** an update becomes available

**Then** the auto-updater MUST automatically download the update without user confirmation

**And** notify the user only when download is complete

**Verification**: Set config, trigger update, verify automatic download

#### Scenario: Manual Download Prompt

**Given** `config.updates.autoDownload` is `false`

**When** an update becomes available

**Then** the auto-updater MUST notify the user

**And** wait for explicit user action to start download

**And** NOT download the update automatically

**Verification**: Set config to false, verify update waits for user action

#### Scenario: Auto-Install on Quit

**Given** `config.updates.autoInstallOnAppQuit` is `true`

**And** an update has been downloaded

**When** the user quits the application normally

**Then** the auto-updater MUST install the update before quitting

**Verification**: Download update, quit app, verify update installs

### Requirement: Update Notification UI

The renderer MUST display user-friendly notifications for update events using non-intrusive UI components.

#### Scenario: Update Available Banner

**Given** the renderer receives an `UPDATE_AVAILABLE` event

**When** the event contains version information

**Then** a notification banner MUST appear in the UI

**And** the banner MUST display:
- "Update Available" title
- New version number
- "Download" and "Later" action buttons

**Verification**: Trigger update event, verify banner appears with actions

#### Scenario: Update Ready to Install Banner

**Given** the renderer receives an `UPDATE_DOWNLOADED` event

**When** the event confirms download completion

**Then** a notification banner MUST appear in the UI

**And** the banner MUST display:
- "Update Ready" title
- Version number
- "Install & Restart" and "Later" action buttons

**Verification**: Trigger downloaded event, verify install prompt

#### Scenario: Dismiss Notification

**Given** an update notification banner is displayed

**When** the user clicks "Later" or dismiss button

**Then** the banner MUST be hidden from view

**And** the notification SHOULD reappear on next application launch if update still pending

**Verification**: Dismiss banner, restart app, verify reappears

### Requirement: Update Logging

All auto-updater events and actions MUST be logged with appropriate log levels for debugging and monitoring.

#### Scenario: Update Check Logging

**Given** the auto-updater checks for updates

**When** the check completes successfully

**Then** an info log MUST be written with:
- "Checking for updates..." (at start)
- "Update available" or "Update not available" (at completion)
- Version information in metadata

**Verification**: Check logs/main.log for update check entries

#### Scenario: Update Error Logging

**Given** an error occurs during update process

**When** the error is caught

**Then** an error log MUST be written with:
- Error message
- Error stack trace
- Update context (version, URL, etc.)

**Verification**: Trigger update error, verify detailed error log

## Related Capabilities

- **logging**: Auto-updater uses unified logging system for diagnostics
- **crash-reporting**: Update failures can be reported for monitoring
