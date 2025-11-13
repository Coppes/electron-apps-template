# Design: Renderer Component Organization

## Architecture

### Directory Structure

```
src/renderer/components/
├── features/              # Feature-specific components
│   ├── data-management/   # Data management feature
│   │   ├── SyncQueueViewer.jsx
│   │   ├── DropZone.jsx
│   │   ├── ImportExportDialog.jsx
│   │   └── FileConflictDialog.jsx
│   └── secure-storage/    # Secure storage feature
│       ├── SecureStorageDemo.jsx
│       └── SecureStorageDemo.test.jsx
├── demo/                  # Demonstration components
│   ├── DataManagementDemo.jsx
│   ├── ConnectivityDemo.jsx
│   ├── IPCDemo.jsx
│   ├── LegacyDemo.jsx
│   └── index.js
├── test/                  # Test/playground components
│   ├── FeatureTestTemplate.jsx
│   └── index.js
├── shared/                # Shared utility components
│   ├── ErrorBoundary.jsx
│   ├── OfflineIndicator.jsx
│   ├── UpdateNotification.jsx
│   └── SafeHTML.jsx
├── ui/                    # UI primitives (existing)
│   ├── Button.jsx
│   ├── Card.jsx
│   └── ...
├── layout/                # Layout components (existing)
│   └── AppShell.jsx
└── pages/                 # Page components (existing + new)
    ├── HomePage.jsx
    ├── DemoPage.jsx
    ├── BackupPage.jsx
    ├── DataManagementDemoPage.jsx
    ├── ConnectivityDemoPage.jsx
    ├── IPCDemoPage.jsx
    ├── SecureStorageDemoPage.jsx
    ├── TestPage.jsx
    ├── ComponentTestPage.jsx
    ├── SettingsPage.jsx
    └── AboutPage.jsx
```

## Component Categories

### 1. Features (`features/`)

**Purpose**: Feature-specific components that implement business logic and interact with IPC APIs.

**Characteristics**:
- Organized by feature domain (data-management, secure-storage, etc.)
- Contains components specific to that feature
- May include tests alongside components
- Used by multiple pages

**Example**:
```jsx
// features/data-management/SyncQueueViewer.jsx
import { useState, useEffect } from 'react';

export default function SyncQueueViewer() {
  const [queue, setQueue] = useState([]);
  // Feature-specific logic
}
```

### 2. Demo (`demo/`)

**Purpose**: Interactive demonstration components showcasing implemented features.

**Characteristics**:
- Self-contained demos with interactive controls
- Demonstrates API usage and patterns
- Includes success/error scenarios
- Educational for developers

**Pattern**:
```jsx
// demo/DataManagementDemo.jsx
export default function DataManagementDemo() {
  return (
    <div>
      <Tabs>
        <TabPanel name="backup">
          {/* Backup demo */}
        </TabPanel>
        <TabPanel name="import-export">
          {/* Import/export demo */}
        </TabPanel>
      </Tabs>
    </div>
  );
}
```

### 3. Test (`test/`)

**Purpose**: Test pages and templates for feature development and validation.

**Characteristics**:
- Playground for testing new features
- Template components for creating new tests
- Interactive property editors
- Development mode only

**Pattern**:
```jsx
// test/FeatureTestTemplate.jsx
export function FeatureTestTemplate({ feature, tests }) {
  return (
    <div className="test-container">
      <h2>{feature} Tests</h2>
      {tests.map(test => (
        <TestCase key={test.id} {...test} />
      ))}
    </div>
  );
}
```

### 4. Shared (`shared/`)

**Purpose**: Reusable utility components used across the application.

**Characteristics**:
- Generic, reusable components
- No feature-specific logic
- Cross-cutting concerns (error handling, notifications)
- Minimal dependencies

**Examples**:
- `ErrorBoundary` - React error boundary wrapper
- `OfflineIndicator` - Network status indicator
- `UpdateNotification` - App update notification
- `SafeHTML` - XSS-safe HTML renderer

## Navigation Structure

### AppShell Updates

```jsx
// components/layout/AppShell.jsx
const navigation = [
  { id: 'home', label: 'Home', icon: 'home' },
  {
    id: 'demos',
    label: 'Demos',
    icon: 'beaker',
    children: [
      { id: 'demo-data', label: 'Data Management' },
      { id: 'demo-connectivity', label: 'Connectivity' },
      { id: 'demo-ipc', label: 'IPC Communication' },
      { id: 'demo-storage', label: 'Secure Storage' },
    ],
  },
  { id: 'backups', label: 'Backups', icon: 'archive' },
  { id: 'sync', label: 'Sync Queue', icon: 'refresh' },
  { id: 'settings', label: 'Settings', icon: 'cog' },
  { id: 'about', label: 'About', icon: 'info' },
];

// Development mode only
if (isDevelopment) {
  navigation.push({
    id: 'tests',
    label: 'Tests',
    icon: 'flask',
    children: [
      { id: 'test-general', label: 'General Tests' },
      { id: 'test-components', label: 'Component Tests' },
    ],
  });
}
```

### Routing Logic

```jsx
// App.jsx
function App() {
  return (
    <AppShell>
      {(currentPage) => {
        switch (currentPage) {
          case 'home': return <HomePage />;
          case 'demo-data': return <DataManagementDemoPage />;
          case 'demo-connectivity': return <ConnectivityDemoPage />;
          case 'demo-ipc': return <IPCDemoPage />;
          case 'demo-storage': return <SecureStorageDemoPage />;
          case 'backups': return <BackupPage />;
          case 'sync': return <SyncQueueViewer />;
          case 'test-general': return <TestPage />;
          case 'test-components': return <ComponentTestPage />;
          case 'settings': return <SettingsPage />;
          case 'about': return <AboutPage />;
          default: return <HomePage />;
        }
      }}
    </AppShell>
  );
}
```

## Demo Page Pattern

### Structure

Each demo page follows this pattern:

1. **Header** - Title, description, purpose
2. **Tabbed Sections** - Separate concerns (create, read, update, delete)
3. **Interactive Controls** - Buttons, forms, inputs
4. **Result Display** - Success messages, error messages, data output
5. **Code Examples** - API usage examples
6. **Documentation Links** - Related docs and guides

### Example Template

```jsx
export default function FeatureDemoPage() {
  const [activeTab, setActiveTab] = useState('create');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  return (
    <div className="demo-page">
      <header>
        <h1>Feature Demo</h1>
        <p>Interactive demonstration of feature capabilities</p>
      </header>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="create">Create</Tab>
        <Tab value="read">Read</Tab>
        <Tab value="update">Update</Tab>
        <Tab value="delete">Delete</Tab>
      </Tabs>

      <TabPanel value={activeTab} name="create">
        {/* Create demo */}
      </TabPanel>

      {/* More tab panels */}

      <ResultDisplay result={result} error={error} />
      
      <CodeExamples />
    </div>
  );
}
```

## Import Patterns

### Barrel Exports

Each directory exports components via index.js:

```js
// features/data-management/index.js
export { default as SyncQueueViewer } from './SyncQueueViewer';
export { default as DropZone } from './DropZone';
export { default as ImportExportDialog } from './ImportExportDialog';
export { default as FileConflictDialog } from './FileConflictDialog';
```

Usage:
```jsx
import { SyncQueueViewer, DropZone } from '../features/data-management';
```

### Absolute Imports (Future Enhancement)

Configure path aliases in build config:
```js
// vite.config.js
resolve: {
  alias: {
    '@features': '/src/renderer/components/features',
    '@demo': '/src/renderer/components/demo',
    '@shared': '/src/renderer/components/shared',
    '@ui': '/src/renderer/components/ui',
  }
}
```

## Migration Strategy

### Phase 1: Move Files
1. Create new directory structure
2. Move files to new locations
3. Keep original functionality intact

### Phase 2: Update Imports
1. Update imports in moved files
2. Update imports in consuming files
3. Run tests to verify no breakage

### Phase 3: Add Barrel Exports
1. Create index.js in each directory
2. Export all components
3. Refactor imports to use barrels

### Phase 4: Create New Pages
1. Build demo pages incrementally
2. Add to navigation as completed
3. Test each page independently

## Testing Strategy

### Unit Tests
- Test components in isolation
- Mock IPC calls
- Test state management
- Test error handling

### Integration Tests
- Test page rendering
- Test navigation
- Test IPC integration
- Test error boundaries

### Visual Testing
- Test responsive layouts
- Test dark/light themes
- Test accessibility
- Test component interactions

## Performance Considerations

### Code Splitting
- Lazy load demo pages
- Lazy load test pages
- Keep shared components in main bundle

### Bundle Size
- Monitor bundle size after reorganization
- Use tree shaking for barrel exports
- Avoid circular dependencies

### Development Experience
- Fast HMR with new structure
- Clear component discovery
- Reduced cognitive load

## Future Enhancements

1. **Storybook Integration** - Visual component documentation
2. **Component Library** - Publish reusable components
3. **Automated Testing** - Visual regression tests
4. **Performance Monitoring** - Component render metrics
5. **Documentation Site** - Auto-generated from JSDoc
