# Spec: Protocol Handler Enhanced

## ADDED Requirements

### Requirement: Deep Link URL Parsing and Validation

The system SHALL parse and validate deep link URLs with query parameters and path segments.

#### Scenario: Parse URL with path segments

**Given** a deep link URL "electronapp://settings/account" is received  
**When** the URL is parsed  
**Then** the protocol SHALL be "electronapp"  
**And** the path segments SHALL be ["settings", "account"]  
**And** the route SHALL be extracted for navigation

#### Scenario: Parse URL with query parameters

**Given** a deep link URL "electronapp://open?file=/path/to/doc&mode=edit"  
**When** the URL is parsed  
**Then** query parameters SHALL be extracted as object { file: "/path/to/doc", mode: "edit" }  
**And** parameters SHALL be URL-decoded properly

#### Scenario: Validate URL against maximum length

**Given** a deep link URL exceeds 2048 characters  
**When** the URL is being processed  
**Then** the system SHALL reject the URL  
**And** SHALL log security warning about oversized URL

#### Scenario: Sanitize URL parameters

**Given** a deep link URL contains potentially malicious parameters  
**When** parameters are extracted  
**Then** special characters SHALL be escaped  
**And** script injection attempts SHALL be prevented

### Requirement: Route-Based Deep Link Navigation

The system SHALL route deep links to specific views or pages within the application.

#### Scenario: Route to settings page

**Given** the deep link "electronapp://settings" is opened  
**When** the URL is processed  
**Then** the application SHALL navigate to settings page  
**And** the settings page SHALL be visible in the main window

#### Scenario: Route to specific item by ID

**Given** the deep link "electronapp://note/abc123" is opened  
**When** the URL is parsed  
**Then** the application SHALL navigate to note view  
**And** SHALL load note with ID "abc123"  
**And** SHALL handle not-found errors gracefully

#### Scenario: Route with action parameter

**Given** the deep link "electronapp://new?type=document" is opened  
**When** the URL is processed  
**Then** the application SHALL trigger "new document" action  
**And** SHALL use "document" as the template type

### Requirement: Deep Link Routing Table

The system SHALL maintain a routing table mapping URL patterns to application views.

#### Scenario: Register route handler

**Given** the application defines a route pattern "profile/:userId"  
**When** a deep link "electronapp://profile/user123" is received  
**Then** the route SHALL match the pattern  
**And** parameters SHALL be extracted { userId: "user123" }  
**And** the associated handler SHALL be invoked

#### Scenario: Handle unregistered routes

**Given** a deep link with unknown route is received  
**When** no matching route is found  
**Then** the application SHALL show error or default view  
**And** SHALL log the unhandled route for debugging

### Requirement: Multi-Instance Deep Link Handling

The system SHALL handle deep links appropriately when multiple application instances may exist.

#### Scenario: Focus existing instance on deep link

**Given** the application is already running  
**And** single instance lock is enabled  
**When** a deep link is received  
**Then** the existing instance SHALL be focused  
**And** the deep link SHALL be passed to the running instance  
**And** a new instance SHALL not be created

#### Scenario: Pass deep link to second instance handler

**Given** a second instance is prevented by single instance lock  
**When** deep link is opened  
**Then** the "second-instance" event SHALL receive the deep link URL  
**And** the first instance SHALL process the deep link

### Requirement: Deep Link File Path Handling

The system SHALL safely handle file paths passed via deep links.

#### Scenario: Open file from deep link

**Given** a deep link "electronapp://open?file=/Users/name/document.txt"  
**When** the file parameter is extracted  
**Then** the file path SHALL be validated  
**And** the file SHALL be opened if it exists  
**And** errors SHALL be shown if file not found

#### Scenario: Prevent directory traversal attacks

**Given** a deep link contains path traversal "../../../etc/passwd"  
**When** the file path is validated  
**Then** the system SHALL reject the path  
**And** SHALL log security warning  
**And** SHALL not access any file

#### Scenario: Validate file extension whitelist

**Given** a deep link specifies a file to open  
**When** the file extension is checked  
**Then** only whitelisted extensions SHALL be allowed  
**And** executable files SHALL be rejected

### Requirement: Platform-Specific Protocol Registration

The system SHALL register the protocol handler appropriately for each platform.

#### Scenario: Register protocol on macOS

**Given** the application is installed on macOS  
**When** the app launches for first time  
**Then** the protocol SHALL be registered using `setAsDefaultProtocolClient()`  
**And** SHALL be declared in Info.plist for installed apps

#### Scenario: Register protocol on Windows

**Given** the application is installed on Windows  
**When** installation completes  
**Then** the protocol SHALL be registered in Windows Registry  
**And** SHALL be associated with the application executable

#### Scenario: Register protocol on Linux

**Given** the application is installed on Linux  
**When** installation completes  
**Then** the protocol SHALL be registered in .desktop file  
**And** SHALL follow XDG desktop entry specification

### Requirement: Deep Link from Browser

The system SHALL handle deep links opened from web browsers.

#### Scenario: Open app from browser link

**Given** a user clicks a link "electronapp://action" in a web browser  
**When** the browser processes the link  
**Then** it SHALL prompt user to open the application (first time)  
**And** SHALL launch the application with the deep link

#### Scenario: Remember browser protocol handler preference

**Given** the user has previously approved opening the protocol  
**When** another link is clicked in browser  
**Then** the application SHALL open immediately without prompt  
**And** SHALL process the deep link as expected

### Requirement: Deep Link Error Handling

The system SHALL handle malformed or invalid deep links gracefully.

#### Scenario: Handle malformed URL

**Given** a malformed deep link is received  
**When** URL parsing fails  
**Then** an error SHALL be logged  
**And** the application SHALL show main window (fallback behavior)  
**And** SHALL not crash

#### Scenario: Handle missing required parameters

**Given** a route requires specific parameters  
**And** a deep link is missing those parameters  
**When** the route is processed  
**Then** an error message SHALL be shown to user  
**And** SHALL guide user to correct usage

### Requirement: Deep Link Analytics and Logging

The system SHALL log deep link usage for debugging and analytics.

#### Scenario: Log successful deep link navigation

**Given** a deep link is processed successfully  
**When** navigation completes  
**Then** the event SHALL be logged with URL and route  
**And** SHALL include timestamp and user context

#### Scenario: Log deep link errors

**Given** a deep link fails to process  
**When** an error occurs  
**Then** the error SHALL be logged with full details  
**And** SHALL include the failing URL and error reason

### Requirement: Deep Link Developer Documentation

The system SHALL provide clear documentation for deep link URL formats and routing.

#### Scenario: Document supported URL patterns

**Given** the application supports deep linking  
**When** developers review documentation  
**Then** all supported URL patterns SHALL be documented  
**And** examples SHALL be provided for each pattern  
**And** parameter requirements SHALL be clearly stated
