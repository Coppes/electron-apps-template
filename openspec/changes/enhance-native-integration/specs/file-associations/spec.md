# Spec: File Associations

## ADDED Requirements

### Requirement: The app MUST handle specific file extensions via OS launch.
The application MUST register itself as a handler for configured file extensions and process files opened via the OS.
#### Scenario: Launch from closed state
  - **Given** the app is not running.
  - **When** the user opens a file with extension `.myapp`.
  - **Then** the app launches.
  - **And** the app receives the file path via `app:file-opened` event.
  - **And** the app navigates to a file viewer or import screen for that file.

#### Scenario: Open while running
  - **Given** the app is running in the background.
  - **When** the user opens a file with extension `.myapp`.
  - **Then** the existing app window comes to foreground.
  - **And** the app receives the `app:file-opened` event with the new file path.

### Requirement: The app MUST validate input paths methods.
All file paths received from the OS MUST be validated to ensure they are safe and accessible before being processed.
#### Scenario: Malicious path sanitization
  - **Given** an OS open event with a suspicious path (e.g., extremely long, symbolic links, etc.).
  - **When** the handler processes the path.
  - **Then** it validates the path exists and is accessible before sending to renderer.
