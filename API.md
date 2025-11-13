# API Documentation

This document describes the complete IPC API available to renderer processes.

## Overview

All communication between renderer and main processes is handled through a secure IPC bridge exposed via the preload script. The API is available through `window.electronAPI`.

## API Reference

### Window Management

#### `window.create(type, options)`

Create a new window.

**Parameters**:
- `type` (string, required): Window type - 'main', 'settings', or 'about'
- `options` (object, optional): Window configuration options

**Returns**: `Promise<{success: boolean, windowId: number, error?: string}>`

**Example**:
```javascript
const result = await window.electronAPI.window.create('settings');
if (result.success) {
  console.log('Window created:', result.windowId);
}
```

#### `window.close(windowId)`

Close a specific window.

**Parameters**:
- `windowId` (number, required): ID of window to close

**Returns**: `Promise<{success: boolean}>`

**Example**:
```javascript
await window.electronAPI.window.close(123);
```

#### `window.minimize()`

Minimize the current window.

**Returns**: `Promise<{success: boolean}>`

**Example**:
```javascript
await window.electronAPI.window.minimize();
```

#### `window.maximize()`

Maximize or restore the current window.

**Returns**: `Promise<{success: boolean}>`

**Example**:
```javascript
await window.electronAPI.window.maximize();
```

#### `window.getState()`

Get the current window's state (position, size, etc.).

**Returns**: `Promise<{success: boolean, state: WindowState}>`

**WindowState** object:
```typescript
{
  x: number;          // X position
  y: number;          // Y position
  width: number;      // Window width
  height: number;     // Window height
  isMaximized: boolean;
  isFullScreen: boolean;
}
```

**Example**:
```javascript
const { state } = await window.electronAPI.window.getState();
console.log('Window at:', state.x, state.y);
```

---

### Data Persistence

#### `store.get(key)`

Get a value from persistent storage.

**Parameters**:
- `key` (string, required): Storage key

**Returns**: `Promise<any>` - The stored value or undefined

**Example**:
```javascript
const theme = await window.electronAPI.store.get('theme');
console.log('Current theme:', theme);
```

#### `store.set(key, value)`

Store a value persistently.

**Parameters**:
- `key` (string, required): Storage key
- `value` (any, required): Value to store (must be JSON-serializable)

**Returns**: `Promise<{success: boolean}>`

**Example**:
```javascript
await window.electronAPI.store.set('theme', 'dark');
await window.electronAPI.store.set('settings', {
  notifications: true,
  autoStart: false
});
```

#### `store.delete(key)`

Delete a key from storage.

**Parameters**:
- `key` (string, required): Storage key to delete

**Returns**: `Promise<{success: boolean}>`

**Example**:
```javascript
await window.electronAPI.store.delete('temporary-data');
```

#### `store.clear()`

Clear all stored data.

**Returns**: `Promise<{success: boolean}>`

**Example**:
```javascript
await window.electronAPI.store.clear();
```

#### `store.has(key)`

Check if a key exists in storage.

**Parameters**:
- `key` (string, required): Storage key to check

**Returns**: `Promise<boolean>`

**Example**:
```javascript
const hasTheme = await window.electronAPI.store.has('theme');
```

---

### Dialogs

#### `dialog.openFile(options)`

Show native file selection dialog.

**Parameters**:
- `options` (object, optional): Dialog options
  - `title` (string): Dialog title
  - `defaultPath` (string): Default directory
  - `filters` (array): File type filters
  - `properties` (array): Selection properties (e.g., ['openFile', 'multiSelections'])

**Returns**: `Promise<{canceled: boolean, filePaths: string[]}>`

**Example**:
```javascript
const result = await window.electronAPI.dialog.openFile({
  title: 'Select a file',
  filters: [
    { name: 'Text Files', extensions: ['txt', 'md'] },
    { name: 'All Files', extensions: ['*'] }
  ],
  properties: ['openFile']
});

if (!result.canceled) {
  console.log('Selected:', result.filePaths[0]);
}
```

#### `dialog.saveFile(options)`

Show native file save dialog.

**Parameters**:
- `options` (object, optional): Dialog options
  - `title` (string): Dialog title
  - `defaultPath` (string): Default file name/path
  - `filters` (array): File type filters

**Returns**: `Promise<{canceled: boolean, filePath: string}>`

**Example**:
```javascript
const result = await window.electronAPI.dialog.saveFile({
  title: 'Save document',
  defaultPath: 'document.txt',
  filters: [
    { name: 'Text Files', extensions: ['txt'] }
  ]
});

if (!result.canceled) {
  console.log('Save to:', result.filePath);
}
```

#### `dialog.showMessage(options)`

Show a message box dialog.

**Parameters**:
- `options` (object, required): Message options
  - `type` (string): 'none', 'info', 'error', 'question', 'warning'
  - `title` (string): Dialog title
  - `message` (string): Main message text
  - `detail` (string, optional): Additional detail text
  - `buttons` (array, optional): Button labels

**Returns**: `Promise<{response: number}>` - Index of clicked button

**Example**:
```javascript
const result = await window.electronAPI.dialog.showMessage({
  type: 'question',
  title: 'Confirm Action',
  message: 'Are you sure?',
  detail: 'This action cannot be undone.',
  buttons: ['Cancel', 'OK']
});

if (result.response === 1) {
  // User clicked OK
}
```

#### `dialog.showError(title, message)`

Show an error dialog.

**Parameters**:
- `title` (string, required): Error title
- `message` (string, required): Error message

**Returns**: `Promise<void>`

**Example**:
```javascript
await window.electronAPI.dialog.showError(
  'File Not Found',
  'The requested file could not be located.'
);
```

---

### Application Info

#### `app.getVersion()`

Get application version information.

**Returns**: `Promise<{app: string, electron: string, chrome: string, node: string}>`

**Example**:
```javascript
const versions = await window.electronAPI.app.getVersion();
console.log('App version:', versions.app);
console.log('Electron version:', versions.electron);
```

#### `app.getPath(name)`

Get special directory path.

**Parameters**:
- `name` (string, required): Path name - 'home', 'appData', 'userData', 'temp', 'exe', 'downloads', 'documents', 'pictures', 'videos', 'music'

**Returns**: `Promise<string>` - The directory path

**Example**:
```javascript
const userDataPath = await window.electronAPI.app.getPath('userData');
console.log('User data stored at:', userDataPath);
```

#### `app.quit()`

Quit the application.

**Returns**: `Promise<void>`

**Example**:
```javascript
await window.electronAPI.app.quit();
```

#### `app.relaunch()`

Restart the application.

**Returns**: `Promise<void>`

**Example**:
```javascript
await window.electronAPI.app.relaunch();
```

#### `app.checkForUpdates()`

Check for application updates.

**Returns**: `Promise<{available: boolean, version?: string}>`

**Example**:
```javascript
const update = await window.electronAPI.app.checkForUpdates();
if (update.available) {
  console.log('Update available:', update.version);
}
```

#### `app.installUpdate()`

Install a downloaded update and restart.

**Returns**: `Promise<void>`

**Example**:
```javascript
await window.electronAPI.app.installUpdate();
```

---

### System Information

#### `system.getPlatform()`

Get the operating system platform.

**Returns**: `Promise<string>` - 'darwin' (macOS), 'win32' (Windows), or 'linux'

**Example**:
```javascript
const platform = await window.electronAPI.system.getPlatform();
if (platform === 'darwin') {
  console.log('Running on macOS');
}
```

---

### Logging

Send log messages to the main process for persistent logging.

#### `log.debug(message, ...args)`

Log debug information (development only).

**Parameters**:
- `message` (string, required): Log message
- `...args` (any, optional): Additional context data

**Example**:
```javascript
window.electronAPI.log.debug('Component mounted', { componentName: 'App' });
```

#### `log.info(message, ...args)`

Log informational messages.

**Parameters**:
- `message` (string, required): Log message
- `...args` (any, optional): Additional context data

**Example**:
```javascript
window.electronAPI.log.info('User logged in', { userId: 123 });
```

#### `log.warn(message, ...args)`

Log warnings.

**Parameters**:
- `message` (string, required): Warning message
- `...args` (any, optional): Additional context data

**Example**:
```javascript
window.electronAPI.log.warn('API rate limit approaching', { remaining: 10 });
```

#### `log.error(message, ...args)`

Log errors.

**Parameters**:
- `message` (string, required): Error message
- `...args` (any, optional): Error object and context data

**Example**:
```javascript
try {
  // Some operation
} catch (error) {
  window.electronAPI.log.error('Operation failed', error, { context: 'data' });
}
```

---

### Event Listeners

Subscribe to events from the main process.

#### `onUpdateAvailable(callback)`

Listen for available updates.

**Parameters**:
- `callback` (function): `(info: {version: string, releaseDate: string}) => void`

**Returns**: `Function` - Cleanup function to remove listener

**Example**:
```javascript
const cleanup = window.electronAPI.onUpdateAvailable((info) => {
  console.log('Update available:', info.version);
  // Show notification to user
});

// Later, to remove listener:
cleanup();
```

#### `onUpdateDownloaded(callback)`

Listen for completed update downloads.

**Parameters**:
- `callback` (function): `(info: {version: string}) => void`

**Returns**: `Function` - Cleanup function

**Example**:
```javascript
window.electronAPI.onUpdateDownloaded((info) => {
  console.log('Update downloaded:', info.version);
  // Prompt user to restart
});
```

#### `onUpdateError(callback)`

Listen for update errors.

**Parameters**:
- `callback` (function): `(error: Error) => void`

**Returns**: `Function` - Cleanup function

**Example**:
```javascript
window.electronAPI.onUpdateError((error) => {
  console.error('Update failed:', error.message);
});
```

#### `onUpdateProgress(callback)`

Listen for update download progress.

**Parameters**:
- `callback` (function): `(progress: {percent: number, transferred: number, total: number}) => void`

**Returns**: `Function` - Cleanup function

**Example**:
```javascript
window.electronAPI.onUpdateProgress((progress) => {
  console.log(`Download progress: ${progress.percent}%`);
  // Update progress bar
});
```

---

## Error Handling

All IPC calls return promises that may reject with errors. Always handle errors appropriately:

```javascript
try {
  const result = await window.electronAPI.store.get('key');
  console.log(result);
} catch (error) {
  console.error('IPC call failed:', error.message);
  // Show user-friendly error message
}
```

### Error Response Format

When an IPC call fails, the response will include:

```typescript
{
  success: false,
  error: string,      // Error message
  code?: string,      // Error code (if applicable)
  details?: any       // Additional error details
}
```

## Type Safety

This API uses JSDoc type definitions for better IDE support. For TypeScript projects, type definitions are available in `src/common/types.js`.

## Security Considerations

- All IPC calls are validated by the main process
- File paths are sanitized to prevent directory traversal
- External URLs are blocked by navigation guards
- Sensitive operations require user confirmation
- All security events are logged for audit

## Best Practices

1. **Always handle errors**: Use try/catch for all async operations
2. **Clean up event listeners**: Store cleanup functions and call them when components unmount
3. **Validate user input**: Validate on renderer side before sending to main
4. **Use appropriate dialog types**: Choose the right dialog for the user action
5. **Provide user feedback**: Show loading states and success/error messages
6. **Log important events**: Use the logging API for debugging and audit trails
7. **Respect user privacy**: Don't log sensitive information
8. **Handle edge cases**: Consider offline mode, permissions denied, etc.

## Examples

### Complete File Operation

```javascript
async function saveUserSettings(settings) {
  try {
    // Show save dialog
    const { canceled, filePath } = await window.electronAPI.dialog.saveFile({
      title: 'Save Settings',
      defaultPath: 'settings.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (canceled) return;

    // Save to selected path
    await window.electronAPI.store.set(filePath, settings);

    // Show success message
    await window.electronAPI.dialog.showMessage({
      type: 'info',
      title: 'Success',
      message: 'Settings saved successfully!'
    });

  } catch (error) {
    // Show error dialog
    await window.electronAPI.dialog.showError(
      'Save Failed',
      `Could not save settings: ${error.message}`
    );
    
    // Log for debugging
    window.electronAPI.log.error('Save settings failed', error);
  }
}
```

### Update Notification System

```javascript
import { useEffect, useState } from 'react';

function UpdateNotifier() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check for updates on mount
    checkForUpdates();

    // Listen for update events
    const cleanupAvailable = window.electronAPI.onUpdateAvailable((info) => {
      setUpdateInfo(info);
    });

    const cleanupProgress = window.electronAPI.onUpdateProgress((prog) => {
      setProgress(prog.percent);
    });

    const cleanupDownloaded = window.electronAPI.onUpdateDownloaded(() => {
      // Prompt user to restart
      promptToInstall();
    });

    // Cleanup on unmount
    return () => {
      cleanupAvailable();
      cleanupProgress();
      cleanupDownloaded();
    };
  }, []);

  async function checkForUpdates() {
    try {
      const update = await window.electronAPI.app.checkForUpdates();
      if (update.available) {
        setUpdateInfo(update);
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }

  async function promptToInstall() {
    const result = await window.electronAPI.dialog.showMessage({
      type: 'question',
      title: 'Update Ready',
      message: 'A new version has been downloaded.',
      detail: 'Restart now to install the update?',
      buttons: ['Later', 'Restart Now']
    });

    if (result.response === 1) {
      await window.electronAPI.app.installUpdate();
    }
  }

  if (!updateInfo) return null;

  return (
    <div className="update-notification">
      <p>Update {updateInfo.version} available</p>
      {progress > 0 && <progress value={progress} max={100} />}
    </div>
  );
}
```
