# Spec: Backup and Restore

## ADDED Requirements

### Requirement: Manual Backup Creation

The system SHALL allow users to create manual backups of application data including electron-store and SQLite databases (when present).

#### Scenario: Create manual backup

**Given** the user is on the Backup page  
**When** the user clicks "Create Backup"  
**Then** a backup file SHALL be created in ZIP format  
**And** the backup SHALL include electron-store data  
**And** the backup SHALL include SQLite databases if present  
**And** a success message SHALL be displayed with the backup location

#### Scenario: Backup includes manifest

**Given** a backup is being created  
**When** the backup file is generated  
**Then** a manifest.json file SHALL be included in the ZIP  
**And** the manifest SHALL contain: timestamp, app version, backup type, checksum  
**And** the manifest SHALL list all included files

#### Scenario: Choose backup location

**Given** the user initiates a manual backup  
**When** prompted for save location  
**Then** a file save dialog SHALL open  
**And** the default filename SHALL be `backup-YYYY-MM-DD-HHMMSS.zip`  
**And** the user SHALL be able to choose a custom location

### Requirement: Automatic Backup Schedule

The system SHALL support automatic backups on a configurable schedule (daily, weekly, or disabled).

#### Scenario: Configure automatic backup

**Given** the user is in backup settings  
**When** the user selects "Daily" backup schedule  
**Then** the setting SHALL be saved to electron-store  
**And** automatic backups SHALL run daily at midnight  
**And** old backups SHALL be automatically deleted per retention policy

#### Scenario: Automatic backup triggers

**Given** automatic backups are enabled  
**And** 24 hours have elapsed since the last backup  
**When** the application is running  
**Then** a backup SHALL be created automatically  
**And** the user SHALL be notified (non-blocking)

#### Scenario: Skip automatic backup if recently backed up

**Given** automatic backups are configured for daily  
**And** a manual backup was created 2 hours ago  
**When** the automatic backup timer triggers  
**Then** the automatic backup SHALL be skipped  
**And** the next automatic backup SHALL be scheduled for tomorrow

### Requirement: Backup Restoration

Users SHALL be able to restore data from a backup file, replacing current application data.

#### Scenario: Select backup to restore

**Given** the user is on the Backup page  
**When** the user clicks "Restore Backup"  
**Then** a file picker dialog SHALL open  
**And** only ZIP files SHALL be selectable  
**And** the user SHALL be able to browse to a backup file

#### Scenario: Validate backup before restore

**Given** a backup file is selected for restoration  
**When** the file is opened  
**Then** the system SHALL extract and validate the manifest  
**And** SHALL verify the checksum matches  
**And** SHALL check for file integrity  
**And** if validation fails, SHALL show an error and abort

#### Scenario: Confirm restore operation

**Given** a valid backup file is ready to restore  
**When** the validation completes  
**Then** a confirmation dialog SHALL appear  
**And** SHALL warn: "This will replace all current data. Continue?"  
**And** SHALL show backup date and size  
**And** restoration SHALL only proceed if confirmed

#### Scenario: Restore data and restart

**Given** the user confirms restoration  
**When** the restore operation begins  
**Then** all windows SHALL close  
**And** current electron-store data SHALL be backed up (safety copy)  
**And** backup contents SHALL be extracted to appropriate locations  
**And** the application SHALL restart automatically

### Requirement: Backup History and Management

The system SHALL maintain a history of backups and provide management features.

#### Scenario: View backup history

**Given** the user is on the Backup page  
**When** the page loads  
**Then** a list of available backups SHALL be displayed  
**And** each backup SHALL show: date, size, type (manual/automatic)  
**And** backups SHALL be sorted by date (newest first)

#### Scenario: Delete old backup

**Given** backup history is displayed  
**When** the user clicks "Delete" next to a backup  
**Then** a confirmation dialog SHALL appear  
**And** if confirmed, the backup file SHALL be deleted  
**And** the backup SHALL be removed from history

#### Scenario: Backup retention policy

**Given** automatic backups are configured  
**And** the retention limit is set to 10 backups  
**When** the 11th backup is created  
**Then** the oldest backup SHALL be automatically deleted  
**And** the deletion SHALL be logged

### Requirement: Backup Integrity Verification

All backups SHALL include checksums for integrity verification and corruption detection.

#### Scenario: Calculate checksum during backup

**Given** a backup is being created  
**When** files are added to the ZIP  
**Then** SHA-256 checksums SHALL be calculated for each file  
**And** checksums SHALL be stored in the manifest

#### Scenario: Verify checksum during restore

**Given** a backup is being restored  
**When** files are extracted  
**Then** SHA-256 checksums SHALL be recalculated  
**And** SHALL be compared with manifest values  
**And** if mismatches are found, restoration SHALL abort with error

### Requirement: Incremental Backup Support

The system SHALL support incremental backups that only include changed files since the last backup.

#### Scenario: Create incremental backup

**Given** automatic backups are enabled  
**And** a full backup exists  
**When** an automatic backup is triggered  
**Then** only files modified since the last backup SHALL be included  
**And** the manifest SHALL indicate backup type: "incremental"  
**And** the manifest SHALL reference the base full backup

#### Scenario: Restore from incremental backup

**Given** an incremental backup is selected for restoration  
**When** the restoration begins  
**Then** the system SHALL require the base full backup  
**And** SHALL apply the incremental changes on top of the full backup  
**And** if the base backup is missing, SHALL show an error

### Requirement: SQLite Database Backup

When SQLite databases are present (from add-secure-storage), the system SHALL include them in backups.

#### Scenario: Detect SQLite database

**Given** the add-secure-storage feature is implemented  
**When** a backup is created  
**Then** the system SHALL detect SQLite database files  
**And** SHALL include them in the backup ZIP

#### Scenario: Backup SQLite safely

**Given** a SQLite database is being backed up  
**When** the backup process runs  
**Then** the database SHALL be backed up using SQLite backup API (not file copy)  
**And** SHALL ensure data consistency (no corruption)  
**And** SHALL not lock the database for extended periods

### Requirement: Backup Encryption (Optional)

The system SHALL optionally support encrypted backups using the secure-storage encryption.

#### Scenario: Create encrypted backup

**Given** the user enables "Encrypt Backups" in settings  
**When** a backup is created  
**Then** the backup ZIP SHALL be encrypted  
**And** the encryption SHALL use the OS keychain (safeStorage)  
**And** the backup SHALL only be restorable on the same machine

#### Scenario: Restore encrypted backup

**Given** an encrypted backup is selected  
**When** restoration begins  
**Then** the system SHALL decrypt the ZIP using safeStorage  
**And** if decryption fails (wrong machine), SHALL show error  
**And** SHALL prevent restoration of encrypted backups on different machines

### Requirement: Backup Error Handling

The system SHALL handle errors during backup and restore operations gracefully.

#### Scenario: Handle insufficient disk space

**Given** a backup is being created  
**When** the disk runs out of space  
**Then** the backup operation SHALL abort  
**And** partial backup files SHALL be deleted  
**And** an error SHALL be shown: "Insufficient disk space for backup"

#### Scenario: Handle corrupted backup file

**Given** a corrupted backup file is selected for restoration  
**When** the file is validated  
**Then** corruption SHALL be detected via checksum mismatch  
**And** an error SHALL be shown: "Backup file is corrupted"  
**And** no restoration SHALL occur

### Requirement: Backup Progress Indication

Backup and restore operations SHALL show progress to keep users informed during long operations.

#### Scenario: Show backup progress

**Given** a large backup is being created  
**When** the operation is in progress  
**Then** a progress bar SHALL be displayed  
**And** SHALL show percentage complete (0-100%)  
**And** SHALL show estimated time remaining

#### Scenario: Cancellable backup

**Given** a backup is in progress  
**When** the user clicks "Cancel"  
**Then** the backup operation SHALL be canceled  
**And** partial backup files SHALL be deleted  
**And** the operation SHALL complete within 2 seconds of cancel request
