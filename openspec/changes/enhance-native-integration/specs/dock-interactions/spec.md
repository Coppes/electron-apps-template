# Spec: Dock & Taskbar Interactions

## ADDED Requirements

### Requirement: The app MUST display an informational badge on its icon.
The application MUST update the dock or taskbar icon badge to reflect the count of unread notifications or status.
#### Scenario: Unread notifications badge
  - **Given** the user has 3 unread messages.
  - **When** the configured badge state updates.
  - **Then** the dock icon (macOS) shows a red badge "3".
  - **And** the taskbar icon (Windows) shows an overlay badge if supported.

### Requirement: The app MUST provide quick actions via icon context menu.
The application MUST provide a set of quick actions in the dock or taskbar context menu for easy access to common tasks.
#### Scenario: Dock quick actions
  - **Given** the app is running.
  - **When** the user right-clicks the dock/taskbar icon.
  - **Then** a menu appears with custom items like "New Window" or "Sync Now".
  - **When** the user selects an action.
  - **Then** the corresponding IPC event is triggered in the app.
