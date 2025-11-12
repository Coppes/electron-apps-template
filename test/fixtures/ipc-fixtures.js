/**
 * Test fixtures for IPC communication payloads
 */

// App IPC payloads
export const appIpcPayloads = {
  getVersion: {
    valid: {},
    invalid: null,
  },
  getPath: {
    valid: { name: 'userData' },
    invalidType: { name: 123 },
    invalidName: { name: 'invalidPath' },
    missing: {},
  },
  setTitle: {
    valid: { title: 'Test Title' },
    empty: { title: '' },
    invalid: { title: 123 },
    missing: {},
  },
  minimizeWindow: {
    valid: {},
  },
  maximizeWindow: {
    valid: {},
  },
  closeWindow: {
    valid: {},
  },
  quitApp: {
    valid: {},
  },
};

// Dialog IPC payloads
export const dialogIpcPayloads = {
  showOpenDialog: {
    valid: {
      title: 'Open File',
      defaultPath: '/home',
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile', 'multiSelections'],
    },
    minimal: {},
    invalid: { filters: 'not-an-array' },
  },
  showSaveDialog: {
    valid: {
      title: 'Save File',
      defaultPath: '/home/document.txt',
      filters: [{ name: 'Text Files', extensions: ['txt'] }],
    },
    minimal: {},
  },
  showMessageBox: {
    valid: {
      type: 'info',
      title: 'Information',
      message: 'This is a message',
      buttons: ['OK', 'Cancel'],
    },
    error: {
      type: 'error',
      title: 'Error',
      message: 'An error occurred',
      buttons: ['OK'],
    },
    minimal: {
      message: 'Simple message',
    },
  },
};

// Store IPC payloads
export const storeIpcPayloads = {
  get: {
    valid: { key: 'user.name' },
    withDefault: { key: 'user.age', defaultValue: 0 },
    invalid: { key: 123 },
    missing: {},
  },
  set: {
    valid: { key: 'user.name', value: 'John Doe' },
    nested: { key: 'settings.theme.color', value: 'dark' },
    nullValue: { key: 'temp', value: null },
    invalid: { key: 123, value: 'test' },
    missingKey: { value: 'test' },
    missingValue: { key: 'test' },
  },
  delete: {
    valid: { key: 'user.temp' },
    invalid: { key: 123 },
    missing: {},
  },
  has: {
    valid: { key: 'user.name' },
    invalid: { key: 123 },
    missing: {},
  },
  clear: {
    valid: {},
  },
};

// File operation payloads
export const fileIpcPayloads = {
  openFile: {
    valid: { path: '/mock/file.txt' },
    invalid: { path: 123 },
    missing: {},
  },
  saveFile: {
    valid: { path: '/mock/save.txt', content: 'Hello World' },
    empty: { path: '/mock/empty.txt', content: '' },
    large: { path: '/mock/large.txt', content: 'x'.repeat(1024 * 1024) },
    invalid: { path: 123, content: 'test' },
    missingPath: { content: 'test' },
    missingContent: { path: '/mock/file.txt' },
  },
};

// Update IPC payloads
export const updateIpcPayloads = {
  checkForUpdates: {
    valid: {},
  },
  quitAndInstall: {
    valid: {},
  },
  updateAvailable: {
    valid: {
      version: '1.1.0',
      releaseDate: '2023-10-01',
      releaseName: 'Version 1.1.0',
      releaseNotes: 'Bug fixes and improvements',
    },
  },
  updateProgress: {
    valid: {
      bytesPerSecond: 1024000,
      percent: 45.5,
      transferred: 5242880,
      total: 11534336,
    },
  },
  updateDownloaded: {
    valid: {
      version: '1.1.0',
      files: ['/path/to/installer.exe'],
      path: '/path/to/installer.exe',
      sha512: 'abc123...',
      releaseDate: '2023-10-01',
    },
  },
};

// Edge case payloads
export const edgeCasePayloads = {
  null: null,
  undefined: undefined,
  emptyObject: {},
  emptyArray: [],
  largeObject: {
    data: Array(1000).fill({ key: 'value', nested: { deep: true } }),
  },
  specialCharacters: {
    key: 'special!@#$%^&*()_+-=[]{}|;:,.<>?',
    value: '特殊字符 🎉 émojis',
  },
  circularReference: (() => {
    const obj = { name: 'circular' };
    obj.self = obj;
    return obj;
  })(),
};
