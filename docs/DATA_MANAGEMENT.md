# Data Management Features

This document describes the comprehensive data management features available in the Electron Apps Template.

## Table of Contents

- [Backup & Restore](#backup--restore)
- [Import & Export](#import--export)
- [File Operations](#file-operations)
- [Offline Mode & Sync Queue](#offline-mode--sync-queue)
- [Security Features](#security-features)

## Backup & Restore

### Features

- **Automated Backups**: Create ZIP-based backups of application data
- **Integrity Checks**: SHA-256 checksums for all backup files
- **Retention Policies**: Automatic cleanup of old backups
- **Secure Storage**: Optional encryption for sensitive data (requires add-secure-storage)

### Usage

```javascript
// Create a backup
const result = await window.electronAPI.data.createBackup({
  includeSecureStorage: true
});
// Returns: { success: true, filename: 'backup-2025-11-13-*.zip', path: '...' }

// List available backups
const backups = await window.electronAPI.data.listBackups();
// Returns: { success: true, backups: [...] }

// Restore from backup
await window.electronAPI.data.restoreBackup({
  filename: 'backup-2025-11-13-*.zip'
});

// Delete old backup
await window.electronAPI.data.deleteBackup({
  filename: 'backup-2025-11-13-*.zip'
});
```

### Backup Structure

Backups are ZIP files containing:
- `manifest.json`: Metadata and checksums
- `electron-store.json`: Application settings
- `secure-storage.enc`: Encrypted sensitive data (if enabled)

## Import & Export

### Supported Formats

1. **JSON**: Full data structure preservation
2. **CSV**: Tabular data for spreadsheet compatibility
3. **Markdown**: Human-readable documentation

### Usage

```javascript
// Export data
await window.electronAPI.data.export({
  filePath: '/path/to/export.json',
  format: 'json', // 'json' | 'csv' | 'markdown'
  options: {
    pretty: true,
    includeMetadata: true
  }
});

// Import data
const result = await window.electronAPI.data.import({
  filePath: '/path/to/import.json',
  format: 'json',
  options: {
    validate: true,
    merge: false // or true to merge with existing data
  }
});
```

### Format Handlers

Each format has a dedicated handler:

- **JSONHandler**: Preserves complex data structures
- **CSVHandler**: Uses csv-parse/csv-stringify for robust parsing
- **MarkdownHandler**: Uses marked library for rendering

### Custom Format Handlers

```javascript
// Register custom format handler
importExportManager.registerHandler('xml', {
  export: async (data, filePath, options) => {
    // Convert data to XML and write to file
  },
  import: async (filePath, options) => {
    // Read and parse XML file
    return { success: true, data: parsedData };
  }
});
```

## File Operations

### Drag & Drop

#### React Hook

```jsx
import { useDragDrop } from '../hooks/useDragDrop';

function MyComponent() {
  const { isDragging, dragHandlers } = useDragDrop({
    onDrop: async (files) => {
      console.log('Files dropped:', files);
    },
    accept: ['.json', '.csv', '.txt'],
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <div {...dragHandlers}>
      {isDragging ? 'Drop files here!' : 'Drag files here'}
    </div>
  );
}
```

#### DropZone Component

```jsx
import DropZone from '../components/DropZone';

function MyPage() {
  return (
    <DropZone
      onDrop={(files) => console.log('Dropped:', files)}
      accept={['.json', '.csv']}
      maxSize={10 * 1024 * 1024}
    />
  );
}
```

### File Watching

Monitor external file changes:

```javascript
// Start watching a file
await window.electronAPI.file.watchStart({
  filePath: '/path/to/file.json'
});

// Listen for changes
window.electronAPI.file.onFileChanged((data) => {
  console.log('File changed:', data.filePath);
  console.log('Change type:', data.changeType); // 'modified' | 'renamed' | 'deleted'
});

// Stop watching
await window.electronAPI.file.watchStop({
  filePath: '/path/to/file.json'
});
```

## Offline Mode & Sync Queue

### Connectivity Monitoring

```jsx
import { useOfflineStatus } from '../hooks/useOfflineStatus';

function MyComponent() {
  const { isOnline, checkNow } = useOfflineStatus();

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <button onClick={checkNow}>Check Now</button>
    </div>
  );
}
```

### Sync Queue Operations

```javascript
// Enqueue operation for sync when online
await window.electronAPI.data.enqueueSyncOperation({
  type: 'create', // 'create' | 'update' | 'delete'
  entity: 'user',
  data: { id: 1, name: 'John' }
});

// Manually trigger sync
await window.electronAPI.data.processSyncQueue();

// Get queue status
const status = await window.electronAPI.data.getSyncQueueStatus();
// Returns: { totalOperations: 5, pendingCount: 2, lastSync: timestamp }

// View operations
const operations = await window.electronAPI.data.getSyncQueueOperations();

// Retry failed operation
await window.electronAPI.data.retrySyncOperation({
  operationId: 'op-123'
});
```

### Backend Adapters

The sync queue supports different backend types:

```javascript
// Mock adapter (for testing)
import MockAdapter from './adapters/mock-adapter';

// REST API adapter
class RestAdapter {
  async syncOperation(operation) {
    const response = await fetch(`/api/${operation.entity}`, {
      method: operation.type === 'create' ? 'POST' : 'PUT',
      body: JSON.stringify(operation.data)
    });
    return response.json();
  }
}

// Configure sync queue with adapter
syncQueue.initialize(new RestAdapter());
```

## Security Features

### Path Validation

All file paths are validated to prevent:
- Path traversal attacks (`../../../etc/passwd`)
- Null byte injection
- Access to system directories
- Executable file uploads

### Rate Limiting

Protection against abuse:
- File operations: 10 per second
- Backups: 5 per minute
- Import/Export: 3 per minute

### Content Sanitization

- Remove script tags from HTML/Markdown
- Strip event handlers (onclick, onerror, etc.)
- Remove javascript: and data:text/html URLs
- Sanitize filenames (remove control characters)

### Data Validation

- Maximum file size enforcement (default 100MB)
- Maximum record count (default 10,000)
- File extension allowlist
- Parameter validation for all IPC calls

### Integrity Checks

- SHA-256 checksums for all backup files
- Manifest validation on restore
- Corrupted file detection

## UI Components

### BackupPage

Complete backup management interface:

```jsx
import BackupPage from './components/pages/BackupPage';

// Renders backup list with create/restore/delete actions
```

### ImportExportDialog

Modal dialog for data import/export:

```jsx
import ImportExportDialog from './components/ImportExportDialog';

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button onClick={() => setShowDialog(true)}>Import</button>
      <ImportExportDialog
        isOpen={showDialog}
        mode="import" // or "export"
        onClose={() => setShowDialog(false)}
      />
    </>
  );
}
```

### FileConflictDialog

Resolve file conflicts with visual diff:

```jsx
import FileConflictDialog from './components/FileConflictDialog';

<FileConflictDialog
  isOpen={showConflict}
  conflict={{
    filename: 'data.json',
    local: { modifiedAt: Date.now(), preview: '...' },
    remote: { modifiedAt: Date.now(), preview: '...' }
  }}
  onResolve={(resolution) => {
    // resolution: 'keep-local' | 'keep-remote' | 'merge' | 'rename'
  }}
  onClose={() => setShowConflict(false)}
/>
```

### SyncQueueViewer

Monitor and manage sync operations:

```jsx
import SyncQueueViewer from './components/SyncQueueViewer';

// Renders sync queue with status cards and operation list
```

### OfflineIndicator

Visual connectivity status:

```jsx
import OfflineIndicator from './components/OfflineIndicator';

<OfflineIndicator position="top-right" />
// Positions: top-right, top-left, bottom-right, bottom-left
```

## Best Practices

### 1. Always Validate User Input

```javascript
const validation = await validateFilePath(filePath, {
  allowedExtensions: ['.json', '.csv'],
  maxSize: 10 * 1024 * 1024,
  mustExist: true
});

if (!validation.valid) {
  console.error('Invalid file:', validation.error);
  return;
}
```

### 2. Handle Errors Gracefully

```javascript
try {
  await window.electronAPI.data.createBackup();
} catch (error) {
  // Show user-friendly error message
  console.error('Backup failed:', error.message);
}
```

### 3. Use Rate Limiting Feedback

```javascript
const result = await window.electronAPI.data.createBackup();
if (result.code === 'RATE_LIMIT_EXCEEDED') {
  alert('Please wait before creating another backup');
}
```

### 4. Clean Up File Watchers

```javascript
useEffect(() => {
  window.electronAPI.file.watchStart({ filePath });
  
  return () => {
    window.electronAPI.file.watchStop({ filePath });
  };
}, [filePath]);
```

### 5. Test Offline Scenarios

```javascript
// Test sync queue behavior
await window.electronAPI.data.enqueueSyncOperation({
  type: 'create',
  entity: 'test',
  data: { id: 1 }
});

// Operations are stored locally and synced when online
```

## Configuration

### File Operation Limits

Edit `src/main/security/data-security.js`:

```javascript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_EXTENSIONS = ['.txt', '.json', '.csv', ...];
```

### Rate Limits

```javascript
export const fileOperationLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 1000 // 10 operations per second
});
```

### Sync Queue Settings

Edit `src/main/data/sync-queue.js`:

```javascript
const MAX_QUEUE_SIZE = 10000;
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000;
```

## Troubleshooting

### Backup Creation Fails

**Problem**: Backup creation returns error
**Solution**: Check disk space and permissions

```javascript
const result = await window.electronAPI.data.createBackup();
if (!result.success) {
  console.error('Error:', result.error);
  // Check: disk space, write permissions
}
```

### Import Fails with Large Files

**Problem**: Import timeout or memory error
**Solution**: Increase file size limit or use streaming

```javascript
// Adjust limits in validation
const validation = await validateFilePath(filePath, {
  maxSize: 500 * 1024 * 1024 // 500MB
});
```

### Sync Queue Not Processing

**Problem**: Operations stuck in queue
**Solution**: Check connectivity and adapter configuration

```javascript
const status = await window.electronAPI.data.getSyncQueueStatus();
console.log('Queue status:', status);

// Check connectivity
const connectivity = await window.electronAPI.data.getConnectivityStatus();
console.log('Is online:', connectivity.isOnline);
```

## Performance Tips

1. **Batch Operations**: Enqueue multiple operations before triggering sync
2. **Use Streaming**: For files >10MB, consider streaming instead of loading into memory
3. **Debounce File Watching**: File watcher has 300ms debounce by default
4. **Limit Queue Size**: Keep queue under 1000 operations for best performance
5. **Clean Old Backups**: Delete backups older than retention period

## Security Considerations

1. **Never trust client input**: All IPC parameters are validated
2. **Sanitize content**: HTML/Markdown is sanitized before rendering
3. **Rate limit operations**: Prevents DOS attacks
4. **Validate file paths**: Prevents directory traversal
5. **Use integrity checks**: SHA-256 checksums verify backup integrity
