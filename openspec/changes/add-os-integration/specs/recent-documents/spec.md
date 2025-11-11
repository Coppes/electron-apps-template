# Spec: Recent Documents

## ADDED Requirements

### Requirement: Add Documents to OS Recent Files List

The system SHALL add documents to the operating system's recent files list for quick access.

#### Scenario: Add document after successful save

**Given** a user saves a document to disk  
**When** the save operation completes successfully  
**Then** the document path SHALL be added to OS recent documents list  
**And** SHALL appear in system recent files menu

#### Scenario: Add document after successful open

**Given** a user opens an existing document  
**When** the document loads successfully  
**Then** the document path SHALL be added to OS recent documents list  
**And** SHALL move to top of recent files if already present

### Requirement: Validate File Paths Before Adding

The system SHALL validate file paths before adding to recent documents.

#### Scenario: Verify file exists before adding to recent list

**Given** a file path is being added to recent documents  
**When** the file does not exist on disk  
**Then** the system SHALL not add it to recent documents  
**And** SHALL log a warning about missing file

#### Scenario: Reject remote URLs as recent documents

**Given** a URL with http:// or https:// protocol is provided  
**When** attempting to add to recent documents  
**Then** the system SHALL reject the URL  
**And** SHALL only accept local file:// paths

#### Scenario: Validate file path format

**Given** a file path is being validated  
**When** the path contains invalid characters or patterns  
**Then** the system SHALL sanitize or reject the path  
**And** SHALL prevent path traversal attempts

### Requirement: Platform-Specific Recent Document Display

The system SHALL integrate with platform-specific recent document mechanisms.

#### Scenario: Recent documents in macOS Dock menu

**Given** the application is running on macOS  
**And** documents have been added to recent list  
**When** the user right-clicks the dock icon  
**Then** a "Recent Documents" section SHALL appear in dock menu  
**And** SHALL list up to 10 recent documents

#### Scenario: Recent documents in Windows Jump List

**Given** the application is running on Windows 7+  
**And** documents have been added to recent list  
**When** the user right-clicks the taskbar icon  
**Then** a "Recent" section SHALL appear in jump list  
**And** SHALL list recent documents with file icons

#### Scenario: Recent documents in Linux file manager

**Given** the application is running on Linux  
**And** documents have been added to recent list  
**When** supported by desktop environment  
**Then** recent documents SHALL appear in file manager's recent view

### Requirement: Recent Document Limits

The system SHALL respect platform limits for recent documents list.

#### Scenario: Limit recent documents to platform maximum

**Given** the application has opened many documents  
**When** the recent documents list reaches platform limit (typically 10-20)  
**Then** the oldest documents SHALL be automatically removed  
**And** new documents SHALL be added to the top

#### Scenario: Automatically maintain list size

**Given** recent documents are being added over time  
**When** the list would exceed maximum size  
**Then** the system SHALL automatically prune oldest entries  
**And** SHALL maintain list in most-recent-first order

### Requirement: Clear Recent Documents

The system SHALL allow clearing of recent documents for privacy.

#### Scenario: Clear all recent documents

**Given** recent documents list contains entries  
**When** the user clears recent documents via settings  
**Then** all entries SHALL be removed from OS recent files list  
**And** the list SHALL be empty immediately

#### Scenario: Clear specific recent document

**Given** a specific document is in recent list  
**When** the user removes that document from recent list  
**Then** only that document SHALL be removed  
**And** other recent documents SHALL remain

### Requirement: Recent Document Click Handling

The system SHALL handle when users open files from recent documents list.

#### Scenario: Open document from recent list

**Given** a document is in the OS recent list  
**When** the user selects it from recent menu  
**Then** the application SHALL launch (if not running)  
**And** SHALL open the selected document  
**And** SHALL handle file-not-found errors gracefully

#### Scenario: Focus existing window if document already open

**Given** a document is already open in the application  
**When** the user selects it from recent list  
**Then** the existing window with that document SHALL be focused  
**And** a new window SHALL not be opened

### Requirement: Privacy and Security for Sensitive Files

The system SHALL provide options to exclude sensitive files from recent documents.

#### Scenario: Exclude file from recent documents by configuration

**Given** a file is marked as sensitive in application settings  
**When** the file is saved or opened  
**Then** it SHALL not be added to OS recent documents list  
**And** user privacy SHALL be preserved

#### Scenario: Clear recent documents on secure mode activation

**Given** the application enters secure or private mode  
**When** secure mode is activated  
**Then** all recent documents SHALL be cleared automatically  
**And** new documents SHALL not be added until secure mode is disabled

### Requirement: Recent Documents in Application UI

The system SHALL provide a recent documents list within the application UI.

#### Scenario: Display recent documents in File menu

**Given** recent documents exist  
**When** the user opens the File menu  
**Then** a "Recent Files" submenu SHALL appear  
**And** SHALL list recent documents in order  
**And** clicking a document SHALL open it

#### Scenario: Recent documents on welcome screen

**Given** the application shows a welcome/start screen  
**When** recent documents exist  
**Then** they SHALL be displayed on the welcome screen  
**And** SHALL be clickable to open documents quickly

### Requirement: Automatic Recent Document Tracking

The system SHALL automatically track documents without manual API calls for common operations.

#### Scenario: Automatically track on file save dialog

**Given** the user saves a file using native file dialog  
**When** the save completes successfully  
**Then** the file SHALL be automatically added to recent documents  
**And** no manual tracking call SHALL be required

#### Scenario: Automatically track on file open dialog

**Given** the user opens a file using native file dialog  
**When** a file is selected and opened  
**Then** the file SHALL be automatically added to recent documents  
**And** SHALL integrate with IPC file handlers

### Requirement: Recent Document File Icons

The system SHALL display appropriate file icons in recent documents list.

#### Scenario: Use application icon for app-specific files

**Given** a recent document has app-specific file extension  
**When** displayed in OS recent list  
**Then** the application's document icon SHALL be shown  
**And** SHALL help users identify file type

#### Scenario: Use system icon for standard files

**Given** a recent document is a standard file type (PDF, image, etc.)  
**When** displayed in recent list  
**Then** the system default icon for that file type SHALL be shown
