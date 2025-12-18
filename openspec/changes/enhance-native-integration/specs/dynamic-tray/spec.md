# Spec: Dynamic System Tray

## ADDED Requirements

### Requirement: The tray icon MUST reflect application status.
The system tray icon MUST change its visual appearance to reflect the current connectivity or application status.
#### Scenario: Offline status
  - **Given** the app loses internet connection.
  - **When** the connectivity status changes to "offline".
  - **Then** the tray icon updates to a visually distinct "offline" version (e.g., greyed out or with a warning symbol).

### Requirement: The tray icon MUST indicate errors.
Critical errors MUST be visually indicated on the system tray icon to alert the user.
#### Scenario: Error indication
  - **Given** a critical background error.
  - **When** the error state is set.
  - **Then** the tray icon shows a red error indicator.
