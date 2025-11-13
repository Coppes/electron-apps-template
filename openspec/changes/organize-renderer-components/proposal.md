# Change: Organize Renderer Components and Create Demo/Test Pages

## Why

The current renderer component structure has become disorganized with 12 root-level components mixing different concerns (features, demos, utilities). As features are implemented (data management, secure storage, etc.), there's no clear structure for demonstration pages or test pages. This makes it difficult to:

- Find and maintain components
- Demonstrate implemented features
- Test new features during development
- Onboard new developers

## What Changes

- **Reorganize component structure** into clear categories:
  - `features/` - Feature-specific components (data management, secure storage, connectivity)
  - `demo/` - Demonstration components showcasing implemented features
  - `test/` - Test/playground pages for development and validation
  - `shared/` - Shared utility components (ErrorBoundary, OfflineIndicator, UpdateNotification)
  - Keep existing: `ui/`, `layout/`, `pages/`

- **Create demonstration pages** for implemented features:
  - DataManagementDemo - Backup, import/export, file watching, drag-drop
  - SecureStorageDemo - Move existing demo to features/, create dedicated page
  - ConnectivityDemo - Offline/online behavior, sync queue visualization
  - IPCDemo - IPC communication patterns and validation

- **Create test pages** for feature development:
  - TestPage - General playground for ad-hoc testing
  - FeatureTestPage - Template for testing new features
  - ComponentTestPage - Interactive UI component tester

- **Update navigation and routing**:
  - Add "Demos" section in navigation
  - Add "Tests" section in development mode
  - Update App.jsx routing logic

## Impact

### Affected Specs

- renderer-ui (new capability for organized component structure)
- demo-pages (new capability for feature demonstrations)
- test-infrastructure (enhancement for test pages)

### Affected Code

- `src/renderer/components/` - Reorganization of all components
- `src/renderer/App.jsx` - Updated routing and imports
- `src/renderer/components/layout/AppShell.jsx` - Updated navigation structure
- Component imports throughout renderer code

### Benefits

- Clear separation of concerns
- Easy discovery of features and demos
- Better developer experience for testing
- Improved maintainability
- Foundation for future feature additions

### Migration

All existing components will be moved to appropriate subdirectories. Import paths will be updated across the codebase. No breaking changes to functionality.
