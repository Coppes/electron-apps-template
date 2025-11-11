# Spec: System Tray

## ADDED Requirements

### Requirement: Tray Icon Creation and Lifecycle

The system SHALL provide a persistent tray icon that remains visible in the system notification area (Windows/Linux) or menu bar (macOS) independent of window state.

#### Scenario: Create tray icon on app startup

**Given** the application starts for the first time  
**When** the tray icon is initialized  
**Then** the icon SHALL appear in the system tray/menu bar  
**And** the icon SHALL use platform-appropriate format (template image on macOS, PNG on Windows/Linux)  
**And** the icon SHALL remain visible when main window is closed

#### Scenario: Tray icon persists when all windows are closed

**Given** the application has a visible tray icon  
**And** at least one application window is open  
**When** all application windows are closed  
**Then** the tray icon SHALL remain visible in the system tray  
**And** the application process SHALL continue running

#### Scenario: Remove tray icon on app quit

**Given** the application has a visible tray icon  
**When** the user quits the application via menu or shortcut  
**Then** the tray icon SHALL be removed from the system tray  
**And** the application process SHALL terminate

### Requirement: Platform-Specific Icon Handling

The system SHALL automatically select appropriate icon format based on operating system.

#### Scenario: Use template image on macOS

**Given** the application is running on macOS  
**When** the tray icon is created  
**Then** the system SHALL use a template image (monochrome with transparency)  
**And** the icon SHALL automatically adapt to menu bar theme (dark/light mode)

#### Scenario: Use standard PNG on Windows and Linux

**Given** the application is running on Windows or Linux  
**When** the tray icon is created  
**Then** the system SHALL use a standard colored PNG image  
**And** the icon SHALL be sized at 16x16 or 32x32 pixels based on system DPI

### Requirement: Dynamic Icon Updates

The system SHALL support dynamic tray icon updates to reflect application state.

#### Scenario: Update icon to show notification badge

**Given** the application has an active tray icon  
**When** a new notification or unread item is received  
**Then** the tray icon SHALL update to show a badge or overlay indicator  
**And** the icon SHALL revert to normal when notifications are cleared

#### Scenario: Update icon during long-running operation

**Given** the application is performing a long-running task  
**When** the task is in progress  
**Then** the tray icon MAY show an animation or progress indicator  
**And** the icon SHALL revert when the task completes

### Requirement: Tray Icon Visibility Control

The system SHALL allow configuration to show or hide the tray icon.

#### Scenario: Disable tray icon via configuration

**Given** the tray icon feature is disabled in configuration  
**When** the application starts  
**Then** no tray icon SHALL be created  
**And** the application SHALL behave as a standard windowed application

#### Scenario: Show tray icon after being hidden

**Given** the tray icon is hidden  
**When** the user enables tray icon in settings  
**Then** the tray icon SHALL appear in the system tray  
**And** all tray menu functionality SHALL be available

### Requirement: Tray Icon Click Behavior

The system SHALL respond to user clicks on the tray icon.

#### Scenario: Show main window on tray icon click

**Given** the main window is hidden or minimized  
**When** the user clicks the tray icon  
**Then** the main window SHALL be shown and brought to foreground  
**And** the window SHALL be focused for keyboard input

#### Scenario: Toggle window visibility on repeated clicks

**Given** the main window is visible and focused  
**When** the user clicks the tray icon  
**Then** the main window SHALL be hidden  
**And** the application SHALL continue running in background

### Requirement: Tray Icon Tooltip

The system SHALL display informative text when user hovers over tray icon.

#### Scenario: Show application name in tooltip

**Given** the tray icon is visible  
**When** the user hovers the mouse over the icon  
**Then** a tooltip SHALL appear showing the application name  
**And** optionally showing current status or unread count
