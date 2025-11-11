# Window Management Specification

## ADDED Requirements

### Requirement: Window Creation and Configuration
The system SHALL provide a centralized WindowManager that creates and configures BrowserWindow instances with consistent security settings and lifecycle management.

#### Scenario: Create main window on application startup
- **WHEN** the application starts and the 'ready' event fires
- **THEN** the WindowManager creates a main window with default dimensions (1200x800)
- **AND** the window has contextIsolation enabled and nodeIntegration disabled
- **AND** the preload script is loaded from the correct path for dev/prod environments

#### Scenario: Create secondary window on demand
- **WHEN** a user or IPC handler requests a new window with type 'settings'
- **THEN** the WindowManager creates a new BrowserWindow with type-specific configuration
- **AND** the window is tracked in the internal windows Map with a unique ID
- **AND** the window ID is returned to the caller

#### Scenario: Prevent invalid window configuration
- **WHEN** attempting to create a window with invalid options (e.g., negative dimensions)
- **THEN** the WindowManager throws a validation error
- **AND** no window is created

### Requirement: Window State Persistence
The system SHALL automatically save and restore window state (position, size, maximized state) across application restarts using electron-store.

#### Scenario: Save window state on close
- **WHEN** a window is closed
- **THEN** the current window bounds (x, y, width, height) are saved to persistent storage
- **AND** the maximized state (boolean) is saved
- **AND** the window ID or type is used as the storage key

#### Scenario: Restore window state on creation
- **WHEN** creating a window with a previously saved state
- **THEN** the WindowManager retrieves the saved bounds from storage
- **AND** applies the bounds to the new window
- **AND** restores the maximized state if it was maximized
- **AND** ensures the window is visible on at least one connected display

#### Scenario: Handle missing saved state gracefully
- **WHEN** creating a window with no previously saved state
- **THEN** the WindowManager uses default dimensions and centers the window
- **AND** no error is thrown

### Requirement: Multi-Window Management
The system SHALL support multiple concurrent windows with independent lifecycles and state tracking.

#### Scenario: Track multiple open windows
- **WHEN** multiple windows are created (main, settings, about)
- **THEN** each window is stored in the WindowManager's windows Map with a unique ID
- **AND** each window can be retrieved by its ID
- **AND** each window's state is saved independently

#### Scenario: Close specific window by ID
- **WHEN** a close request is issued for a specific window ID
- **THEN** the WindowManager retrieves the window from the Map
- **AND** closes the window gracefully
- **AND** removes it from the Map
- **AND** saves its final state before removal

#### Scenario: Close all windows on application quit
- **WHEN** the application quit event is triggered
- **THEN** the WindowManager iterates through all open windows
- **AND** saves each window's state
- **AND** closes each window
- **AND** clears the windows Map

### Requirement: Application Menu Integration
The system SHALL provide a default application menu with standard items (File, Edit, View, Window, Help) and support custom menu definitions.

#### Scenario: Create default menu on macOS
- **WHEN** the application starts on macOS
- **THEN** a menu bar is created with app name, File, Edit, View, Window, and Help menus
- **AND** standard macOS menu items are included (About, Services, Hide, Quit)
- **AND** the menu is set as the application menu

#### Scenario: Create default menu on Windows/Linux
- **WHEN** the application starts on Windows or Linux
- **THEN** a menu bar is created with File, Edit, View, and Help menus
- **AND** platform-appropriate shortcuts are assigned (Ctrl vs Cmd)
- **AND** the menu is attached to the main window

#### Scenario: Add custom menu item
- **WHEN** defining a custom menu template with additional items
- **THEN** the custom items are merged with the default template
- **AND** the menu is rebuilt with the combined template
- **AND** custom item handlers are registered and functional

### Requirement: Window Restoration on Reopen
The system SHALL handle application reopening on macOS by restoring or creating the main window.

#### Scenario: Restore window when dock icon is clicked (macOS)
- **WHEN** the application is activated via dock icon and no windows are open
- **THEN** the WindowManager creates or restores the main window
- **AND** the window is brought to focus

#### Scenario: Focus existing window when already open
- **WHEN** the application is activated and a window is already open
- **THEN** the existing window is brought to focus
- **AND** no new window is created
