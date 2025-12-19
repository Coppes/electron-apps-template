# tear-out-tabs Specification

## Purpose
TBD - created by archiving change enhance-interface-experience. Update Purpose after archive.
## Requirements
### Requirement: Users MUST be able to tear out tabs into new windows.
The application MUST allow users to drag a tab from the tab bar and drop it outside the current window to spawn a new instance.
#### Scenario: Dragging a tab out
  - **Given** the user has multiple tabs open.
  - **When** the user drags a tab header outside the bounds of the current window.
  - **Then** a new window is created at the drop location.
  - **And** the content of the dragged tab is rendered in the new window.
  - **And** the tab is removed from the original window.

### Requirement: Tearing out MUST preserve tab state.
The state of the torn-out tab (form inputs, scroll position) MUST be preserved where technically feasible.
#### Scenario: State preservation
  - **Given** a tab has unsaved form data.
  - **When** the tab is torn out into a new window.
  - **Then** the form data MUST remain intact in the new window.

