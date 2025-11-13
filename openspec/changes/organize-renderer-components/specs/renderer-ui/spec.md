# Renderer UI Organization Specification

## ADDED Requirements

### Requirement: Component Directory Structure

The renderer SHALL organize components into distinct categories for maintainability and discoverability.

#### Scenario: Feature Components

- **GIVEN** a feature-specific component (e.g., SyncQueueViewer)
- **WHEN** the component is created or moved
- **THEN** it SHALL be placed in `src/renderer/components/features/<feature-name>/`
- **AND** the directory SHALL be named after the feature domain (e.g., data-management, secure-storage)

#### Scenario: Demo Components

- **GIVEN** a demonstration component showcasing features
- **WHEN** the component is created
- **THEN** it SHALL be placed in `src/renderer/components/demo/`
- **AND** it SHALL provide interactive examples of feature usage

#### Scenario: Test Components

- **GIVEN** a test or playground component
- **WHEN** the component is created
- **THEN** it SHALL be placed in `src/renderer/components/test/`
- **AND** it SHALL only be accessible in development mode

#### Scenario: Shared Components

- **GIVEN** a reusable utility component (e.g., ErrorBoundary, OfflineIndicator)
- **WHEN** the component is created or moved
- **THEN** it SHALL be placed in `src/renderer/components/shared/`
- **AND** it SHALL have no feature-specific dependencies

### Requirement: Barrel Exports

Each component directory SHALL provide an index.js file for simplified imports.

#### Scenario: Feature Directory Export

- **GIVEN** components in `features/data-management/`
- **WHEN** an index.js file is created
- **THEN** it SHALL export all components from that directory
- **AND** consumers SHALL import using `import { Component } from 'features/data-management'`

#### Scenario: Demo Directory Export

- **GIVEN** demo components in `demo/`
- **WHEN** an index.js file is created
- **THEN** it SHALL export all demo components
- **AND** prevent circular dependencies

### Requirement: Component Migration

Existing components SHALL be moved to appropriate directories without breaking functionality.

#### Scenario: Move ErrorBoundary to Shared

- **GIVEN** ErrorBoundary.jsx at root level
- **WHEN** moved to `shared/ErrorBoundary.jsx`
- **THEN** all imports SHALL be updated
- **AND** the component SHALL function identically
- **AND** all tests SHALL pass

#### Scenario: Move SecureStorageDemo to Features

- **GIVEN** SecureStorageDemo.jsx at root level
- **WHEN** moved to `features/secure-storage/SecureStorageDemo.jsx`
- **THEN** all imports SHALL be updated
- **AND** the component SHALL function identically

#### Scenario: Move Data Management Components

- **GIVEN** SyncQueueViewer, DropZone, ImportExportDialog, FileConflictDialog at root level
- **WHEN** moved to `features/data-management/`
- **THEN** all imports SHALL be updated across the codebase
- **AND** all components SHALL function identically

### Requirement: Import Path Updates

All imports SHALL be updated to reflect the new component locations.

#### Scenario: Update App.jsx Imports

- **GIVEN** App.jsx importing root-level components
- **WHEN** components are moved to subdirectories
- **THEN** all import paths SHALL be updated
- **AND** the application SHALL build successfully
- **AND** no runtime errors SHALL occur

#### Scenario: Update Page Component Imports

- **GIVEN** page components importing shared/feature components
- **WHEN** component locations change
- **THEN** all imports SHALL be updated
- **AND** pages SHALL render correctly

### Requirement: Development Mode Detection

Test pages SHALL only be accessible in development mode.

#### Scenario: Hide Test Pages in Production

- **GIVEN** the application is built for production
- **WHEN** the navigation is rendered
- **THEN** test page links SHALL NOT appear
- **AND** test routes SHALL NOT be accessible

#### Scenario: Show Test Pages in Development

- **GIVEN** the application is running in development mode
- **WHEN** the navigation is rendered
- **THEN** test page links SHALL appear under a "Tests" section
- **AND** test routes SHALL be accessible
