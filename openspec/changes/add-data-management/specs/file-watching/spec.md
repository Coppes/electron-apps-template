# Spec: File Watching

## ADDED Requirements

### Requirement: External File Change Detection

The system SHALL detect when files opened by the application are modified externally using fs.watch().

#### Scenario: Detect external file modification

**Given** a file is opened in the application  
**And** file watching is active for that file  
**When** the file is modified by another program  
**Then** the system SHALL detect the change within 500ms  
**And** SHALL emit a 'file-changed' event  
**And** SHALL notify the renderer process via IPC

#### Scenario: Debounce rapid changes

**Given** a file is being watched  
**When** multiple change events occur within 300ms  
**Then** only one notification SHALL be sent  
**And** the notification SHALL occur 300ms after the last change  
**And** rapid-fire events SHALL be batched

### Requirement: Conflict Resolution UI

When external changes are detected, the system SHALL provide UI for users to resolve conflicts.

#### Scenario: Show conflict notification

**Given** an opened file is modified externally  
**When** the change is detected  
**Then** a non-blocking notification SHALL appear  
**And** SHALL show: "File changed externally: {filename}"  
**And** SHALL provide action buttons: "Reload", "Keep Current", "Show Diff"

#### Scenario: Reload file

**Given** a file change notification is displayed  
**When** the user clicks "Reload"  
**Then** the file SHALL be reloaded from disk  
**And** local unsaved changes SHALL be discarded  
**And** a confirmation SHALL be shown if unsaved changes exist

#### Scenario: Keep current version

**Given** a file change notification is displayed  
**When** the user clicks "Keep Current"  
**Then** the external changes SHALL be ignored  
**And** the file watcher SHALL continue monitoring  
**And** the local version SHALL remain unchanged

#### Scenario: Show diff view

**Given** a file change notification is displayed  
**When** the user clicks "Show Diff"  
**Then** a diff view SHALL display changes  
**And** SHALL show side-by-side comparison (local vs external)  
**And** SHALL allow user to select which version to keep

### Requirement: File Watch Management

The system SHALL manage file watchers efficiently, starting and stopping watches as files are opened and closed.

#### Scenario: Start watching on file open

**Given** a user opens a file in the application  
**When** the file is loaded  
**Then** a file watcher SHALL be created for that file path  
**And** the watcher SHALL be registered in the watcher registry  
**And** change events SHALL be monitored

#### Scenario: Stop watching on file close

**Given** a file is being watched  
**When** the file is closed in the application  
**Then** the file watcher SHALL be stopped  
**And** SHALL be removed from the watcher registry  
**And** resources SHALL be cleaned up

#### Scenario: Handle file deletion

**Given** a file is being watched  
**When** the file is deleted externally  
**Then** a notification SHALL appear: "File deleted: {filename}"  
**And** SHALL provide options: "Save As", "Recreate", "Close"  
**And** the file watcher SHALL be automatically stopped

#### Scenario: Handle file rename

**Given** a file is being watched  
**When** the file is renamed or moved  
**Then** the watcher SHALL detect the change  
**And** SHALL notify the user: "File moved or renamed"  
**And** SHALL offer to update the file path or close the file

### Requirement: Auto-Reload Configuration

Users SHALL be able to configure automatic reload behavior without prompts.

#### Scenario: Enable auto-reload

**Given** the user enables "Auto-reload changed files" in settings  
**When** a watched file changes externally  
**Then** the file SHALL reload automatically without prompting  
**And** a brief notification SHALL indicate the reload occurred  
**And** no user confirmation SHALL be required

#### Scenario: Auto-reload with unsaved changes

**Given** auto-reload is enabled  
**And** a file has unsaved local changes  
**When** the file changes externally  
**Then** auto-reload SHALL be bypassed  
**And** a conflict prompt SHALL appear  
**And** SHALL prevent automatic data loss

### Requirement: File Watch Performance

File watching SHALL be efficient and not impact application performance.

#### Scenario: Limit number of watchers

**Given** the application has many files open  
**When** the number of active watchers exceeds 100  
**Then** a warning SHALL be logged  
**And** older watchers (for inactive files) SHALL be paused  
**And** performance SHALL remain acceptable

#### Scenario: Memory cleanup

**Given** file watchers are created and destroyed  
**When** a watcher is stopped  
**Then** all event listeners SHALL be removed  
**And** memory SHALL be released  
**And** no memory leaks SHALL occur

### Requirement: Cross-Platform File Watching

File watching SHALL work consistently across macOS, Windows, and Linux despite platform differences.

#### Scenario: File watching on macOS

**Given** the application runs on macOS  
**When** fs.watch() is used  
**Then** FSEvents SHALL be used natively  
**And** change detection SHALL work reliably  
**And** SHALL detect both content and metadata changes

#### Scenario: File watching on Windows

**Given** the application runs on Windows  
**When** fs.watch() is used  
**Then** ReadDirectoryChangesW SHALL be used natively  
**And** SHALL handle locked files gracefully  
**And** SHALL detect changes even when files are in use

#### Scenario: File watching on Linux

**Given** the application runs on Linux  
**When** fs.watch() is used  
**Then** inotify SHALL be used natively  
**And** SHALL handle inotify limits gracefully  
**And** SHALL show error if inotify limit is reached

### Requirement: File Watch Error Handling

The system SHALL handle file watching errors gracefully without crashing.

#### Scenario: Handle watch creation failure

**Given** a file is opened  
**When** fs.watch() fails (permissions, system limits)  
**Then** an error SHALL be logged  
**And** the file SHALL still open without watching  
**And** a notice SHALL inform the user: "Unable to watch file for changes"

#### Scenario: Handle watch error events

**Given** a file watcher is active  
**When** an error event occurs (file system unmounted, etc.)  
**Then** the watcher SHALL be stopped gracefully  
**And** the error SHALL be logged  
**And** the user SHALL be notified if the file is still open
