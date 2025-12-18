# Spec: Multi-Window Manager

## ADDED Requirements

### Requirement: The app MUST support multiple simultaneous windows.
The `WindowManager` MUST allow creating, tracking, and managing secondary "child" windows that operate alongside the main application window.
#### Scenario: Opening a pop-out
  - **Given** the user is viewing a distinct piece of content (e.g., a document or dashboard).
  - **When** the user clicks a "Open in New Window" button.
  - **Then** a new native window opens displaying that content.
  - **And** the main window remains open and functional.

### Requirement: Secondary windows MUST share application state.
All windows MUST reflect the same underlying application data (e.g., authentication status, theme, settings).
#### Scenario: State synchronization
  - **Given** multiple windows are open.
  - **When** the user changes the theme in the main window.
  - **Then** all secondary windows MUST update to the new theme immediately.
