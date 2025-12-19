# whats-new-modal Specification

## Purpose
TBD - created by archiving change enhance-interface-experience. Update Purpose after archive.
## Requirements
### Requirement: The app MUST display a changelog after updates.
The application MUST detect when it has been updated to a new version and present a summary of changes to the user.
#### Scenario: First launch after update
  - **Given** the application has just been updated (currentVersion > lastRunVersion).
  - **When** the application launches.
  - **Then** a "What's New" modal dialog appears.
  - **And** it displays a list of key changes or features.

### Requirement: The modal MUST NOT appear on subsequent launches.
The changelog MUST only be shown once per version update.
#### Scenario: Subsequent launch
  - **Given** the user has already seen the "What's New" modal for version X.
  - **When** the application is restarted.
  - **Then** the modal MUST NOT appear.

