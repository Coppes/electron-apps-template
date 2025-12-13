# Split View Functionality

## ADDED Requirements

### Requirement: Split View Layout
The application MUST support a Split View layout allowing users to view two documents simultaneously.

#### Scenario: Split Vertically
- **GIVEN** a tab is active
- **WHEN** the user triggers a "Split Right" action
- **THEN** the view should divide into two vertical panes
- **AND** the document should be visible in the new pane

### Requirement: Split View Interactions
Users MUST be able to manage Split View via drag-and-drop and context menus.

#### Scenario: Open in Split View via Drag
- **GIVEN** a tab is being dragged
- **WHEN** the user drops the tab onto the content area
- **THEN** the tab should open in a Split View configuration

#### Scenario: Context Menu Control
- **GIVEN** a tab is open
- **WHEN** the user right-clicks the tab
- **THEN** the context menu MUST show options to "Split Right", "Split Down", or similar

#### Scenario: Keyboard Shortcuts
- **GIVEN** the application is focused
- **WHEN** the user presses the configured shortcuts for Split View
- **THEN** the active tab should move or split according to the shortcut (e.g., Move to Next Group)
