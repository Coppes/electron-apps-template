# Spec: Import and Export

## ADDED Requirements

### Requirement: JSON Import/Export

The system SHALL support importing and exporting data in JSON format with schema validation.

#### Scenario: Export data as JSON

**Given** the user selects "Export as JSON"  
**When** the export completes  
**Then** a JSON file SHALL be created with all application data  
**And** the JSON SHALL be formatted (pretty-printed)  
**And** the file SHALL include metadata (export date, app version)

#### Scenario: Import JSON file

**Given** the user selects "Import from JSON"  
**And** chooses a valid JSON file  
**When** the import completes  
**Then** the data SHALL be parsed and validated against schema  
**And** SHALL be merged with or replace existing data (user choice)  
**And** a success message SHALL show number of records imported

#### Scenario: Reject invalid JSON

**Given** a JSON file is selected for import  
**When** the file contains invalid JSON syntax  
**Then** the import SHALL fail with error: "Invalid JSON format"  
**And** no data SHALL be imported  
**And** the error location SHALL be indicated (line number)

### Requirement: CSV Import/Export

The system SHALL support importing and exporting tabular data in CSV format with header detection.

#### Scenario: Export data as CSV

**Given** the user exports tabular data  
**When** CSV format is selected  
**Then** a CSV file SHALL be created with headers  
**And** nested objects SHALL be flattened (dot notation)  
**Example**: `user.name` → `John Doe`  
**And** special characters SHALL be properly escaped

#### Scenario: Import CSV file

**Given** a CSV file is selected for import  
**When** the file is parsed  
**Then** headers SHALL be auto-detected from first row  
**And** data types SHALL be inferred (string, number, boolean)  
**And** malformed rows SHALL be reported but not block import

#### Scenario: Custom CSV delimiter

**Given** a CSV file uses semicolon delimiter  
**When** the file is imported  
**Then** the delimiter SHALL be auto-detected  
**And** the file SHALL be parsed correctly  
**And** common delimiters (comma, semicolon, tab) SHALL be supported

### Requirement: Markdown Import/Export

The system SHALL optionally support Markdown format for human-readable data export.

#### Scenario: Export as Markdown

**Given** the user exports structured data  
**When** Markdown format is selected  
**Then** data SHALL be converted to Markdown tables and lists  
**And** the file SHALL be readable in any Markdown viewer  
**And** metadata SHALL be included as YAML frontmatter

#### Scenario: Import Markdown file

**Given** a Markdown file with tables is selected  
**When** the file is imported  
**Then** tables SHALL be parsed into structured data  
**And** YAML frontmatter SHALL be extracted as metadata  
**And** plain text SHALL be preserved as content

### Requirement: Data Validation

All imported data SHALL be validated against schemas to ensure integrity and security.

#### Scenario: Validate required fields

**Given** imported data is missing required fields  
**When** validation runs  
**Then** the import SHALL fail  
**And** SHALL show error: "Missing required field: {fieldName}"  
**And** SHALL indicate which records are invalid

#### Scenario: Validate data types

**Given** imported data has incorrect data types  
**Example**: string value for numeric field  
**When** validation runs  
**Then** type coercion SHALL be attempted  
**And** if coercion fails, SHALL report validation error  
**And** SHALL allow user to fix or skip invalid records

### Requirement: Large File Handling

The system SHALL handle large import/export files efficiently without blocking the UI.

#### Scenario: Stream large export

**Given** a dataset with 100,000 records is being exported  
**When** the export runs  
**Then** data SHALL be streamed to file (not loaded in memory)  
**And** a progress indicator SHALL show export progress  
**And** the UI SHALL remain responsive

#### Scenario: Chunk large import

**Given** a 100MB CSV file is being imported  
**When** the import runs  
**Then** the file SHALL be processed in chunks  
**And** each chunk SHALL be validated before proceeding  
**And** memory usage SHALL not exceed 200MB

### Requirement: Import/Export Presets

The system SHALL provide predefined export presets for common use cases.

#### Scenario: Export all settings

**Given** the user selects "Export All Settings" preset  
**When** the export runs  
**Then** all application settings SHALL be exported  
**And** user data SHALL be excluded (settings only)  
**And** the file SHALL be named `settings-YYYY-MM-DD.json`

#### Scenario: Custom export preset

**Given** the user creates a custom export preset  
**When** the preset is saved with data type selections  
**Then** the preset SHALL be stored in electron-store  
**And** SHALL be available in future export operations  
**And** SHALL allow quick re-export with same configuration

### Requirement: Import Conflict Resolution

When imported data conflicts with existing data, the system SHALL provide resolution options.

#### Scenario: Detect duplicate records

**Given** imported data contains records with IDs that already exist  
**When** the import runs  
**Then** duplicates SHALL be detected  
**And** the user SHALL be prompted with options:  
  - Skip (keep existing)  
  - Overwrite (replace with import)  
  - Merge (combine fields)

#### Scenario: Merge strategy

**Given** the user selects "Merge" for conflicts  
**When** duplicate records are processed  
**Then** non-conflicting fields SHALL be merged  
**And** conflicting fields SHALL use imported values  
**And** original data SHALL be backed up before merge

### Requirement: Import/Export Security

The system SHALL sanitize and validate all imported data to prevent security vulnerabilities.

#### Scenario: Prevent code injection

**Given** a CSV file contains formula injection attempts  
**Example**: `=1+1` or `=CMD|'calc'!A1`  
**When** the file is imported  
**Then** formula characters SHALL be escaped  
**And** SHALL be treated as plain text, not formulas

#### Scenario: Validate file size

**Given** a file is selected for import  
**When** the file size is checked  
**Then** files exceeding 100MB SHALL be rejected  
**And** SHALL show error: "File too large. Maximum size: 100MB"  
**And** the limit SHALL be configurable in settings

### Requirement: Export Progress and Cancellation

Export operations SHALL be cancellable and show progress for long-running exports.

#### Scenario: Cancel export

**Given** a large export is in progress  
**When** the user clicks "Cancel"  
**Then** the export SHALL stop within 2 seconds  
**And** partial files SHALL be deleted  
**And** a message SHALL confirm cancellation

#### Scenario: Resume failed import

**Given** an import fails halfway through  
**When** the user retries the import  
**Then** the system SHALL offer to resume from the last successful record  
**And** SHALL not re-import already processed records  
**And** SHALL maintain a transaction log for resumption
