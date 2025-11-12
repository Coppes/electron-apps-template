# Spec: Status Bar

## ADDED Requirements

### Requirement: Fixed-Position Status Display

The system SHALL provide a persistent status bar at the bottom of the application window that displays contextual information and remains visible regardless of content scrolling.

#### Scenario: Status bar always visible

**Given** the application window is open  
**When** the user scrolls content vertically  
**Then** the status bar SHALL remain fixed at the bottom  
**And** the status bar SHALL NOT scroll with content

#### Scenario: Status bar respects window resize

**Given** the application window is resized  
**When** the window width changes  
**Then** the status bar SHALL resize to match the window width  
**And** status items SHALL reflow or truncate as needed

### Requirement: Status Item Registration and Positioning

Components SHALL be able to dynamically register status items with the status bar, specifying position (left, center, right) and priority for ordering.

#### Scenario: Register status item in left section

**Given** a component is mounted  
**When** the component registers a status item with position "left"  
**Then** the item SHALL appear in the left section of the status bar  
**And** the item SHALL be visible

#### Scenario: Register status item in center section

**Given** a component registers a status item with position "center"  
**When** the status bar renders  
**Then** the item SHALL appear in the center section  
**And** the item SHALL be horizontally centered

#### Scenario: Register status item in right section

**Given** a component registers a status item with position "right"  
**When** the status bar renders  
**Then** the item SHALL appear in the right section  
**And** the item SHALL be right-aligned

#### Scenario: Multiple items with priority ordering

**Given** two components register items in the left section  
**And** Item A has priority 1 and Item B has priority 2  
**When** the status bar renders  
**Then** Item A SHALL appear before Item B  
**And** items SHALL be ordered by ascending priority

#### Scenario: Unregister status item

**Given** a component has registered a status item  
**When** the component unmounts  
**Then** the status item SHALL be removed from the status bar  
**And** the status bar SHALL update immediately

### Requirement: Status Item Content Types

Status items SHALL support both static text and dynamic React components as content, allowing for rich, interactive status displays.

#### Scenario: Status item with static text

**Given** a component registers a status item with text content  
**When** the status bar renders  
**Then** the text SHALL be displayed  
**And** the text SHALL use the default status bar styling

#### Scenario: Status item with React component

**Given** a component registers a status item with a React component  
**When** the status bar renders  
**Then** the React component SHALL be rendered in the status bar  
**And** the component SHALL be interactive (buttons, dropdowns work)

#### Scenario: Status item with icon and text

**Given** a status item includes an icon and text  
**When** the status bar renders  
**Then** the icon SHALL appear before the text  
**And** icon and text SHALL be vertically aligned

### Requirement: Status Item Updates and Reactivity

Status items SHALL update automatically when their content changes, without requiring manual refresh or re-registration.

#### Scenario: Status item updates on state change

**Given** a status item displays a counter  
**When** the counter value changes  
**Then** the status bar SHALL update immediately  
**And** the new value SHALL be displayed  
**And** no flicker or layout shift SHALL occur

#### Scenario: Throttle rapid updates

**Given** a status item updates more than once per second  
**When** multiple updates occur rapidly  
**Then** updates SHALL be throttled to a maximum of 1 per second  
**And** the most recent value SHALL be displayed

### Requirement: Status Item Click Actions

Status items SHALL support click actions, allowing users to interact with status information (e.g., clicking connection status to reconnect).

#### Scenario: Execute action on status item click

**Given** a status item has a click handler registered  
**When** the user clicks the status item  
**Then** the click handler SHALL be invoked  
**And** the click event SHALL be passed to the handler

#### Scenario: Visual feedback on hover

**Given** a status item has a click handler  
**When** the user hovers over the status item  
**Then** the cursor SHALL change to a pointer  
**And** the item SHALL show a subtle highlight

#### Scenario: Disabled status item not clickable

**Given** a status item is disabled  
**When** the user clicks the status item  
**Then** no action SHALL be executed  
**And** the cursor SHALL remain default (not pointer)

### Requirement: Common Status Items

The system SHALL provide default status items including application version, connection status, and active context information.

#### Scenario: Version status item

**Given** the application is running  
**When** the status bar renders  
**Then** the application version SHALL be displayed in the right section  
**And** the version SHALL be in the format "v1.0.0"

#### Scenario: Connection status indicator

**Given** the application requires network connectivity  
**When** the application is online  
**Then** a "Connected" indicator SHALL appear with a green icon  
**When** the application is offline  
**Then** a "Offline" indicator SHALL appear with a red icon

#### Scenario: Active tab indicator

**Given** multiple tabs are open  
**And** Tab 2 is active  
**When** the status bar renders  
**Then** "Tab 2 of 5" SHALL be displayed in the center section

### Requirement: Status Bar Theme Integration

The status bar SHALL respect the application's theme (light/dark mode) and use appropriate colors and styling.

#### Scenario: Status bar in dark mode

**Given** the application theme is set to dark mode  
**When** the status bar renders  
**Then** the background SHALL be dark  
**And** text SHALL be light-colored  
**And** borders SHALL be subtle

#### Scenario: Status bar in light mode

**Given** the application theme is set to light mode  
**When** the status bar renders  
**Then** the background SHALL be light  
**And** text SHALL be dark-colored

### Requirement: Status Item Overflow Handling

When too many status items exist to fit in the available space, the status bar SHALL truncate or hide lower-priority items with an overflow indicator.

#### Scenario: Truncate low-priority items

**Given** 10 status items are registered in the left section  
**And** the window width is narrow  
**When** not all items fit  
**Then** lower-priority items SHALL be hidden  
**And** an overflow indicator ("...") SHALL appear  
**And** clicking the overflow SHALL show a dropdown with hidden items

#### Scenario: Responsive item visibility

**Given** status items are hidden due to overflow  
**When** the window is resized to be wider  
**Then** hidden items SHALL become visible again  
**And** the overflow indicator SHALL disappear if all items fit

### Requirement: Status Notifications

The status bar SHALL support transient notification messages that appear temporarily to inform users of actions or events.

#### Scenario: Show success notification

**Given** a user action completes successfully  
**When** the action triggers a status notification  
**Then** a success message SHALL appear in the center of the status bar  
**And** the message SHALL display for 3 seconds  
**And** the message SHALL fade out automatically

#### Scenario: Show error notification

**Given** an error occurs  
**When** the error triggers a status notification  
**Then** an error message SHALL appear in the status bar  
**And** the message SHALL have an error icon and red color  
**And** the message SHALL remain until dismissed or 5 seconds elapse

#### Scenario: Queue multiple notifications

**Given** multiple notifications are triggered rapidly  
**When** a notification is already displayed  
**Then** subsequent notifications SHALL be queued  
**And** SHALL display in order after the current one fades out

### Requirement: Status Bar Accessibility

The status bar SHALL be accessible to screen readers with proper ARIA labels and live regions for dynamic content.

#### Scenario: Status bar has accessible role

**Given** a screen reader is active  
**When** the screen reader inspects the status bar  
**Then** the status bar SHALL have role="status"  
**And** individual items SHALL have appropriate labels

#### Scenario: Announce status changes

**Given** a screen reader is active  
**And** a status item content changes  
**When** the change occurs  
**Then** the screen reader SHALL announce the new content  
**And** the announcement SHALL use aria-live="polite"

### Requirement: Status Bar Customization

Users SHALL be able to show/hide the status bar via settings and customize which default items are visible.

#### Scenario: Hide status bar

**Given** the status bar is visible  
**When** the user disables the status bar in settings  
**Then** the status bar SHALL be hidden  
**And** the content area SHALL expand to fill the space

#### Scenario: Show status bar

**Given** the status bar is hidden  
**When** the user enables the status bar in settings  
**Then** the status bar SHALL appear at the bottom  
**And** the content area SHALL resize accordingly

#### Scenario: Customize visible items

**Given** the user opens status bar settings  
**When** the user unchecks "Show version"  
**Then** the version status item SHALL be hidden  
**And** other items SHALL remain visible
