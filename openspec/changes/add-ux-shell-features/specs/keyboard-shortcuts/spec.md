# Spec: Keyboard Shortcuts

## ADDED Requirements

### Requirement: Application-Level Shortcut Registry

The system SHALL maintain a registry of application-level keyboard shortcuts that map shortcut keys to action handlers, distinct from OS-level global shortcuts.

#### Scenario: Default shortcuts defined

**Given** the application starts  
**When** the shortcut registry initializes  
**Then** default shortcuts SHALL be loaded  
**And** default shortcuts SHALL include: Cmd/Ctrl+K (Command Palette), Cmd/Ctrl+, (Settings), Cmd/Ctrl+W (Close Tab)

#### Scenario: Shortcut registry accessible to components

**Given** a React component needs to bind a keyboard shortcut  
**When** the component uses the useKeyboardShortcut hook  
**Then** the hook SHALL access the shortcut registry  
**And** the hook SHALL resolve the current shortcut binding (default or user override)

### Requirement: User-Customizable Shortcuts

Users SHALL be able to customize application-level keyboard shortcuts through a settings interface, with changes persisted across restarts.

#### Scenario: View current shortcuts

**Given** the user opens the Keyboard Shortcuts settings page  
**When** the page renders  
**Then** a list of all customizable shortcuts SHALL be displayed  
**And** each shortcut SHALL show: action name, current key binding, category

#### Scenario: Customize a shortcut

**Given** the user is on the Keyboard Shortcuts settings page  
**When** the user clicks "Edit" next to "Open Command Palette"  
**And** presses Cmd+P (or Ctrl+P on Windows/Linux)  
**Then** the shortcut SHALL be updated to Cmd+P  
**And** the change SHALL be saved to electron-store  
**And** the new shortcut SHALL take effect immediately

#### Scenario: Shortcut persists across restarts

**Given** the user has customized a shortcut  
**When** the application is restarted  
**Then** the customized shortcut SHALL still be in effect  
**And** the default shortcut SHALL be overridden

### Requirement: Shortcut Conflict Detection

The system SHALL detect and prevent shortcut conflicts where the same key combination is assigned to multiple actions.

#### Scenario: Detect conflict when setting shortcut

**Given** Cmd+K is already assigned to "Open Command Palette"  
**When** the user attempts to assign Cmd+K to "Toggle Sidebar"  
**Then** a conflict warning SHALL be displayed  
**And** the warning SHALL show: "Cmd+K is already used by Open Command Palette"  
**And** the user SHALL be prompted: "Replace existing shortcut?"

#### Scenario: Confirm conflict resolution

**Given** a shortcut conflict is detected  
**When** the user confirms "Replace existing shortcut"  
**Then** the old action SHALL have no shortcut (unbound)  
**And** the new action SHALL be assigned the shortcut  
**And** both changes SHALL be saved

#### Scenario: Cancel conflict resolution

**Given** a shortcut conflict is detected  
**When** the user cancels the replacement  
**Then** the existing shortcut SHALL remain unchanged  
**And** the new action SHALL remain with its original shortcut

### Requirement: System Shortcut Blacklist

The system SHALL prevent users from overriding critical system shortcuts (e.g., Cmd+Q, Alt+F4, Cmd+Tab) to avoid breaking OS-level functionality.

#### Scenario: Block system shortcut assignment

**Given** the user is customizing a shortcut  
**When** the user attempts to assign Cmd+Q (Quit)  
**Then** an error message SHALL be displayed: "This shortcut is reserved by the system"  
**And** the shortcut SHALL NOT be saved  
**And** the user SHALL be prompted to choose a different shortcut

#### Scenario: List of blacklisted shortcuts

**Given** the system shortcut blacklist is defined  
**Then** the blacklist SHALL include at minimum:  
- Cmd+Q / Alt+F4 (Quit)  
- Cmd+W / Ctrl+F4 (Close Window)  
- Cmd+Tab / Alt+Tab (Switch Applications)  
- Cmd+M (Minimize)  
- Cmd+H (Hide Window on macOS)

### Requirement: Platform-Specific Shortcut Normalization

The system SHALL automatically convert shortcuts between macOS (Cmd) and Windows/Linux (Ctrl) formats based on the current platform.

#### Scenario: Display shortcuts for current platform

**Given** the user is on macOS  
**When** the Keyboard Shortcuts settings page renders  
**Then** shortcuts SHALL display using Cmd symbol (⌘)  
**And** shortcuts like "CommandOrControl+K" SHALL be shown as "⌘K"

#### Scenario: Display shortcuts on Windows/Linux

**Given** the user is on Windows or Linux  
**When** the Keyboard Shortcuts settings page renders  
**Then** shortcuts SHALL display using "Ctrl" text  
**And** shortcuts like "CommandOrControl+K" SHALL be shown as "Ctrl+K"

#### Scenario: Store shortcuts in platform-agnostic format

**Given** a user customizes a shortcut  
**When** the shortcut is saved to electron-store  
**Then** the shortcut SHALL be stored in platform-agnostic format (e.g., "CommandOrControl+K")  
**And** the shortcut SHALL work correctly when the app runs on different platforms

### Requirement: Shortcut Binding and Execution

The system SHALL provide a hook (useKeyboardShortcut) that allows components to bind handlers to shortcuts and execute them when the shortcut is pressed.

#### Scenario: Bind shortcut in component

**Given** a component needs to handle a keyboard shortcut  
**When** the component calls useKeyboardShortcut('openSettings', handler)  
**Then** the handler SHALL be bound to the current shortcut for 'openSettings'  
**And** when the shortcut is pressed, the handler SHALL be invoked

#### Scenario: Unbind shortcut on component unmount

**Given** a component has bound a keyboard shortcut  
**When** the component unmounts  
**Then** the shortcut binding SHALL be removed  
**And** the shortcut SHALL no longer trigger the handler

#### Scenario: Multiple components bind same action

**Given** two components bind the 'openSettings' action  
**When** the shortcut is pressed  
**Then** both handlers SHALL be invoked  
**And** execution order SHALL be based on registration order

#### Scenario: Shortcut execution prevented by input focus

**Given** a keyboard shortcut is bound to an action  
**And** a text input field has focus  
**When** the user presses the shortcut keys  
**Then** the shortcut SHALL NOT execute if it conflicts with text input  
**And** single-key shortcuts SHALL always be ignored in text inputs  
**And** multi-key shortcuts (Cmd+K) SHALL execute even in text inputs

### Requirement: Shortcut Categories and Grouping

Shortcuts SHALL be organized into logical categories (Navigation, Edit, View, Window, Help) for easy discovery and management.

#### Scenario: Shortcuts grouped by category

**Given** the Keyboard Shortcuts settings page is open  
**When** the shortcuts list renders  
**Then** shortcuts SHALL be grouped by category  
**And** categories SHALL have headers (e.g., "Navigation", "Edit")  
**And** categories SHALL be collapsible for better organization

#### Scenario: Filter shortcuts by category

**Given** the Keyboard Shortcuts settings page is open  
**When** the user selects the "Navigation" category filter  
**Then** only shortcuts in the Navigation category SHALL be displayed  
**And** other categories SHALL be hidden

#### Scenario: Search shortcuts by name or key

**Given** the Keyboard Shortcuts settings page is open  
**When** the user types "command" in the search box  
**Then** shortcuts matching "command" in name or key SHALL be displayed  
**Example**: "Open Command Palette" SHALL appear  
**And** non-matching shortcuts SHALL be hidden

### Requirement: Reset Shortcuts to Defaults

Users SHALL be able to reset all customized shortcuts to their default values, individually or globally.

#### Scenario: Reset individual shortcut

**Given** the user has customized the "Open Settings" shortcut  
**When** the user clicks "Reset to Default" next to the shortcut  
**Then** the shortcut SHALL revert to its default value (Cmd/Ctrl+,)  
**And** the custom binding SHALL be removed from electron-store  
**And** the change SHALL take effect immediately

#### Scenario: Reset all shortcuts

**Given** the user has customized multiple shortcuts  
**When** the user clicks "Reset All to Defaults" button  
**Then** a confirmation dialog SHALL appear: "Reset all shortcuts to defaults?"  
**And** if confirmed, all custom bindings SHALL be removed  
**And** all shortcuts SHALL revert to default values

### Requirement: Shortcut Recording Interface

The settings interface SHALL provide an intuitive shortcut recording UI that captures key presses and validates the combination.

#### Scenario: Enter shortcut recording mode

**Given** the user is editing a shortcut  
**When** the user clicks in the shortcut input field  
**Then** the field SHALL display "Press keys..."  
**And** the field SHALL be in recording mode  
**And** the system SHALL capture the next key combination

#### Scenario: Record valid shortcut

**Given** the shortcut input is in recording mode  
**When** the user presses Cmd+Shift+P  
**Then** the field SHALL display "⌘⇧P" (or "Ctrl+Shift+P" on Windows/Linux)  
**And** the recording mode SHALL end  
**And** the shortcut SHALL be validated

#### Scenario: Record invalid shortcut (single modifier key)

**Given** the shortcut input is in recording mode  
**When** the user presses only Cmd (without another key)  
**Then** the field SHALL display an error: "Invalid shortcut. Must include a non-modifier key"  
**And** the recording SHALL continue waiting for valid input

#### Scenario: Cancel shortcut recording

**Given** the shortcut input is in recording mode  
**When** the user presses Escape  
**Then** the recording mode SHALL end  
**And** the original shortcut SHALL remain unchanged

### Requirement: Shortcut Display in UI

Keyboard shortcuts SHALL be displayed throughout the application (tooltips, menus, command palette) to improve discoverability.

#### Scenario: Show shortcut in tooltip

**Given** a button has an associated keyboard shortcut  
**When** the user hovers over the button  
**Then** the tooltip SHALL display the button label and shortcut  
**Example**: "Settings (⌘,)"

#### Scenario: Show shortcut in command palette

**Given** the command palette is open  
**When** commands are displayed  
**Then** each command SHALL show its shortcut on the right side  
**And** shortcuts SHALL be dimmed/subtle to not distract from command names

#### Scenario: Show shortcut in application menu

**Given** the application menu is open  
**When** menu items are displayed  
**Then** menu items with shortcuts SHALL show the shortcut on the right  
**Example**: "Settings       ⌘,"

### Requirement: Accessibility for Shortcut Management

The keyboard shortcuts interface SHALL be fully accessible with screen reader support, keyboard navigation, and clear visual feedback.

#### Scenario: Screen reader announces shortcut

**Given** a screen reader is active  
**And** the user navigates to a shortcut in the list  
**When** the shortcut is focused  
**Then** the screen reader SHALL announce: "Open Command Palette, Shortcut: Command K, Category: Navigation"

#### Scenario: Navigate shortcuts with keyboard

**Given** the Keyboard Shortcuts settings page is open  
**When** the user presses Tab  
**Then** focus SHALL move between shortcut edit fields  
**And** Enter SHALL activate the focused shortcut for editing

#### Scenario: High contrast mode support

**Given** the system is in high contrast mode  
**When** the Keyboard Shortcuts settings page renders  
**Then** shortcut key badges SHALL have high contrast borders  
**And** conflict warnings SHALL be clearly visible
