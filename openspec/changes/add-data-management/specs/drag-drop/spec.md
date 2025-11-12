# Spec: Drag and Drop

## ADDED Requirements

### Requirement: File Drop Reception

The application SHALL allow users to drag files from the desktop or file explorer into designated drop zones within the application, with secure file path handling.

#### Scenario: Drag file over drop zone

**Given** a drop zone component is rendered  
**When** the user drags a file over the drop zone  
**Then** the drop zone SHALL highlight to indicate it can accept the file  
**And** the cursor SHALL change to indicate a drop operation is possible

#### Scenario: Drop single file

**Given** a file is dragged over a drop zone  
**When** the user releases the mouse button (drops the file)  
**Then** the application SHALL receive the file path  
**And** the file path SHALL be validated in the main process  
**And** the file metadata (name, size, type) SHALL be returned to the renderer

#### Scenario: Drop multiple files

**Given** multiple files are dragged over a drop zone  
**When** the user drops the files  
**Then** the application SHALL receive all file paths  
**And** each file path SHALL be validated independently  
**And** a list of file metadata SHALL be returned

#### Scenario: Drop unsupported file type

**Given** a drop zone accepts only specific file types (e.g., images)  
**When** the user drops a disallowed file type (e.g., .exe)  
**Then** the application SHALL reject the file  
**And** an error message SHALL be displayed: "File type not supported"  
**And** no file path SHALL be processed

#### Scenario: Cancel drop operation

**Given** a file is dragged over a drop zone  
**When** the user moves the file outside the drop zone and releases  
**Then** no drop operation SHALL occur  
**And** the drop zone SHALL return to normal state

### Requirement: Content Export via Drag

The application SHALL allow users to drag content from the application to the desktop or file explorer, creating files on drop.

#### Scenario: Drag content from app to desktop

**Given** a draggable element is rendered in the app  
**When** the user drags the element outside the application window  
**Then** the main process SHALL prepare a temporary file with the content  
**And** Electron's startDrag API SHALL be called with the file path  
**And** the OS SHALL handle the native drag operation

#### Scenario: Drop dragged content on desktop

**Given** content is being dragged from the app  
**When** the user drops it on the desktop  
**Then** a file SHALL be created at the drop location  
**And** the file SHALL contain the exported content  
**And** the file name SHALL match the exported content's title

#### Scenario: Cancel drag operation

**Given** content is being dragged from the app  
**When** the user presses Escape or releases over an invalid drop target  
**Then** the drag operation SHALL be canceled  
**And** no file SHALL be created  
**And** temporary files SHALL be cleaned up

### Requirement: Drop Zone Component

The system SHALL provide a reusable DropZone React component that handles drag-and-drop events and provides visual feedback.

#### Scenario: Render drop zone

**Given** a DropZone component is used in a React component  
**When** the component renders  
**Then** a drop zone area SHALL be displayed  
**And** the drop zone SHALL have a dashed border or visual indicator  
**And** the drop zone SHALL show hint text (e.g., "Drag files here")

#### Scenario: Visual feedback during drag

**Given** a drop zone is rendered  
**When** a file is dragged over the drop zone  
**Then** the drop zone background SHALL change color  
**And** the border SHALL become solid  
**And** the hint text SHALL change to "Drop to upload"

#### Scenario: Custom drop zone configuration

**Given** a developer configures a DropZone component  
**When** custom props are provided (acceptedTypes, maxSize, multiple)  
**Then** the drop zone SHALL enforce the specified constraints  
**And** only files matching the criteria SHALL be accepted

### Requirement: File Path Validation

All file paths received from drag-and-drop operations SHALL be validated in the main process to prevent security vulnerabilities.

#### Scenario: Validate file path for traversal

**Given** a file is dropped into the application  
**When** the file path is validated  
**Then** path traversal attempts (../, ~/, etc.) SHALL be detected  
**And** the file SHALL be rejected if traversal is detected  
**And** an error SHALL be logged

#### Scenario: Validate file extension

**Given** a drop zone only accepts specific extensions (e.g., .jpg, .png)  
**When** a file is dropped  
**Then** the file extension SHALL be extracted and checked  
**And** files with disallowed extensions SHALL be rejected  
**And** an error message SHALL be shown to the user

#### Scenario: Validate file size

**Given** a maximum file size is configured (e.g., 10MB)  
**When** a file is dropped  
**Then** the file size SHALL be checked before processing  
**And** files exceeding the limit SHALL be rejected  
**And** an error message SHALL indicate the size limit

#### Scenario: Validate file existence

**Given** a file path is received from a drop operation  
**When** the path is validated  
**Then** the main process SHALL verify the file exists  
**And** the file SHALL be readable by the application  
**And** if the file doesn't exist or isn't readable, an error SHALL be returned

### Requirement: Drag-and-Drop Hook

The system SHALL provide a useDragDrop React hook that simplifies implementing drag-and-drop functionality in components.

#### Scenario: Use drag-drop hook in component

**Given** a React component needs drag-drop functionality  
**When** the component calls `useDragDrop({ onDrop, acceptedTypes })`  
**Then** the hook SHALL return drag event handlers  
**And** the hook SHALL return drag state (isDragging, isOver)  
**And** the handlers SHALL integrate with native drag events

#### Scenario: Handle drop via hook

**Given** a component uses the useDragDrop hook  
**When** a file is dropped  
**Then** the hook SHALL call the onDrop callback with validated files  
**And** the callback SHALL receive an array of file objects with metadata

### Requirement: Drag-and-Drop IPC Security

All drag-and-drop operations SHALL use IPC to communicate between renderer and main process, with no direct file access from the renderer.

#### Scenario: Drop files triggers IPC call

**Given** a file is dropped in the renderer  
**When** the drop event is handled  
**Then** the renderer SHALL send an IPC message with file paths  
**And** the main process SHALL validate and process the paths  
**And** the result SHALL be returned via IPC response

#### Scenario: Start drag triggers IPC call

**Given** a user initiates a drag from the app  
**When** the drag starts  
**Then** the renderer SHALL send an IPC message with export data  
**And** the main process SHALL prepare the file and call startDrag  
**And** the main process SHALL handle the drag operation

### Requirement: Drag-and-Drop Error Handling

The system SHALL handle errors gracefully during drag-and-drop operations and provide user-friendly feedback.

#### Scenario: Handle file access error

**Given** a file is dropped into the app  
**When** the main process cannot read the file (permissions error)  
**Then** an error SHALL be returned to the renderer  
**And** the user SHALL see: "Cannot access file: Permission denied"  
**And** the operation SHALL not crash the application

#### Scenario: Handle network path

**Given** a file is dropped from a network location  
**When** the file path is a UNC path or network drive  
**Then** the application SHALL attempt to access the file  
**And** if access fails, SHALL show: "Network files may not be accessible"  
**And** the user SHALL be prompted to copy the file locally first

### Requirement: Drag-and-Drop Accessibility

Drag-and-drop functionality SHALL be accessible via keyboard and screen readers, providing alternative input methods.

#### Scenario: Keyboard file selection alternative

**Given** a drop zone is focused  
**When** the user presses Enter or Space  
**Then** a file picker dialog SHALL open  
**And** the user SHALL be able to select files via the dialog  
**And** selected files SHALL be processed as if dropped

#### Scenario: Screen reader announces drop zone

**Given** a screen reader is active  
**When** a drop zone is focused  
**Then** the screen reader SHALL announce "Drop zone for files"  
**And** SHALL indicate accepted file types  
**Example**: "Drop zone for images. Press Enter to select files."

### Requirement: Multiple Drop Zones

The application SHALL support multiple drop zones on the same page, each with independent configuration and behavior.

#### Scenario: Multiple drop zones with different types

**Given** two drop zones exist on a page  
**And** one accepts images, the other accepts documents  
**When** an image is dragged over the image drop zone  
**Then** only the image drop zone SHALL highlight  
**And** the document drop zone SHALL remain inactive

#### Scenario: Drop file on correct zone

**Given** multiple drop zones exist  
**When** a file is dropped on a specific zone  
**Then** only that zone's onDrop handler SHALL be called  
**And** other zones SHALL not receive the drop event

### Requirement: Drag-and-Drop Performance

Drag-and-drop operations SHALL be performant and not block the UI, even with large files or many files.

#### Scenario: Async file processing

**Given** a large file is dropped  
**When** the file is being validated and processed  
**Then** the UI SHALL remain responsive  
**And** a loading indicator SHALL be shown  
**And** the user SHALL be able to cancel the operation

#### Scenario: Throttle drag events

**Given** a file is being dragged over a drop zone  
**When** drag events fire rapidly  
**Then** visual updates SHALL be throttled to 60fps  
**And** the UI SHALL not lag or stutter
