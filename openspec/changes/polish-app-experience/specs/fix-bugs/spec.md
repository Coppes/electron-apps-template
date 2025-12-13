# Fix Critical Bugs

## MODIFIED Requirements

### Requirement: Connectivity Status API
The sync queue status MUST be accessible via the exposed API.

#### Scenario: View Sync Queue
- **WHEN** the user opens the Connectivity page
- **THEN** `window.electronAPI.data.getSyncQueueStatus` should be callable
- **AND** it should return the current queue statistics

### Requirement: Data Import API
The import function MUST accept distinct arguments for file path and options.

#### Scenario: Import File
- **WHEN** `data.import` is called
- **THEN** it should receive `filePath` as a string and `options` as an object
- **AND** the operation should proceed without type validation errors

### Requirement: Backup Restore API
The restore function MUST accept the filename as a string.

#### Scenario: Restore Backup
- **WHEN** `data.restoreBackup` is called
- **THEN** it should receive `filename` as a string
- **AND** the operation should proceed without type validation errors

### Requirement: Theme Persistence
The selected theme MUST be applied immediately on application start.

#### Scenario: Theme Application
- **GIVEN** the user has selected "Dark" theme
- **WHEN** the application starts or reloads
- **THEN** the `dark` class must be present on the `html` element
- **AND** the application must render in dark mode

### Requirement: Localization
Onboarding and History features MUST support all supported locales.

#### Scenario: Onboarding Translation
- **GIVEN** the user's language is not English
- **WHEN** the Onboarding tour is shown
- **THEN** the text should be localized
