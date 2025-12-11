import { vi } from 'vitest';

// ============================================================================
// Electron Main Process Mocks
// ============================================================================

// Mock BrowserWindow
export const mockBrowserWindow = {
  getAllWindows: vi.fn(() => []),
  getFocusedWindow: vi.fn(() => null),
  fromWebContents: vi.fn(() => null),
  fromId: vi.fn(() => null),
};

export class BrowserWindow {
  constructor(_options = {}) {
    this.id = Math.floor(Math.random() * 10000);
    this.webContents = mockWebContents;
    this.isDestroyed = vi.fn(() => false);
    this.close = vi.fn();
    this.destroy = vi.fn();
    this.focus = vi.fn();
    this.blur = vi.fn();
    this.isFocused = vi.fn(() => false);
    this.isVisible = vi.fn(() => true);
    this.show = vi.fn();
    this.hide = vi.fn();
    this.minimize = vi.fn();
    this.maximize = vi.fn();
    this.unmaximize = vi.fn();
    this.isMaximized = vi.fn(() => false);
    this.setFullScreen = vi.fn();
    this.isFullScreen = vi.fn(() => false);
    this.setSize = vi.fn();
    this.getSize = vi.fn(() => [800, 600]);
    this.setPosition = vi.fn();
    this.getPosition = vi.fn(() => [0, 0]);
    this.center = vi.fn();
    this.setTitle = vi.fn();
    this.getTitle = vi.fn(() => 'Test Window');
    this.loadURL = vi.fn(() => Promise.resolve());
    this.loadFile = vi.fn(() => Promise.resolve());
    this.reload = vi.fn();
    this.setMenu = vi.fn();
    this.removeMenu = vi.fn();
    this.on = vi.fn((event, callback) => {
      this[`_${event}`] = callback;
    });
    this.once = vi.fn();
    this.off = vi.fn();
    this.emit = vi.fn((event, ...args) => {
      if (this[`_${event}`]) {
        this[`_${event}`](...args);
      }
    });
  }

  static getAllWindows = mockBrowserWindow.getAllWindows;
  static getFocusedWindow = mockBrowserWindow.getFocusedWindow;
  static fromWebContents = mockBrowserWindow.fromWebContents;
  static fromId = mockBrowserWindow.fromId;
}

// Mock WebContents
export const mockWebContents = {
  id: 1,
  send: vi.fn(),
  executeJavaScript: vi.fn(() => Promise.resolve()),
  openDevTools: vi.fn(),
  closeDevTools: vi.fn(),
  isDevToolsOpened: vi.fn(() => false),
  setWindowOpenHandler: vi.fn(),
  session: {
    setPermissionRequestHandler: vi.fn(),
    setPermissionCheckHandler: vi.fn(),
    clearCache: vi.fn(() => Promise.resolve()),
    clearStorageData: vi.fn(() => Promise.resolve()),
  },
  on: vi.fn(),
  once: vi.fn(),
  off: vi.fn(),
};

// Mock app
export const mockApp = {
  isPackaged: false,
  getVersion: vi.fn(() => '1.0.0'),
  getName: vi.fn(() => 'Test App'),
  getPath: vi.fn((name) => `/mock/path/${name}`),
  getAppPath: vi.fn(() => '/mock/app/path'),
  getLocale: vi.fn(() => 'en-US'),
  isReady: vi.fn(() => true),
  whenReady: vi.fn(() => Promise.resolve()),
  quit: vi.fn(),
  exit: vi.fn(),
  relaunch: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  off: vi.fn(),
  requestSingleInstanceLock: vi.fn(() => true),
  setAppUserModelId: vi.fn(),
};

// Mock dialog
export const mockDialog = {
  showOpenDialog: vi.fn(() => Promise.resolve({ canceled: false, filePaths: ['/mock/file.txt'] })),
  showSaveDialog: vi.fn(() => Promise.resolve({ canceled: false, filePath: '/mock/save.txt' })),
  showMessageBox: vi.fn(() => Promise.resolve({ response: 0 })),
  showErrorBox: vi.fn(),
};

// Mock ipcMain
export const mockIpcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  off: vi.fn(),
  removeHandler: vi.fn(),
  removeAllListeners: vi.fn(),
};

// Mock ipcRenderer
export const mockIpcRenderer = {
  invoke: vi.fn(() => Promise.resolve()),
  send: vi.fn(),
  on: vi.fn((_channel, _callback) => {
    // Return a cleanup function
    return () => { };
  }),
  once: vi.fn(),
  off: vi.fn(),
  removeListener: vi.fn(),
  removeAllListeners: vi.fn(),
};

// Mock session
export const mockSession = {
  defaultSession: {
    setPermissionRequestHandler: vi.fn(),
    setPermissionCheckHandler: vi.fn(),
    clearCache: vi.fn(() => Promise.resolve()),
    clearStorageData: vi.fn(() => Promise.resolve()),
    webRequest: {
      onHeadersReceived: vi.fn(),
      onBeforeRequest: vi.fn(),
    },
  },
};

// Mock shell
export const mockShell = {
  openExternal: vi.fn(() => Promise.resolve()),
  openPath: vi.fn(() => Promise.resolve('')),
  showItemInFolder: vi.fn(),
  moveItemToTrash: vi.fn(() => Promise.resolve(true)),
};

// Mock Menu
export const mockMenu = {
  buildFromTemplate: vi.fn(() => ({})),
  setApplicationMenu: vi.fn(),
  getApplicationMenu: vi.fn(() => null),
};

// Mock Tray
export class Tray {
  constructor(image) {
    this.image = image;
    this.setToolTip = vi.fn();
    this.setContextMenu = vi.fn();
    this.destroy = vi.fn();
    this.on = vi.fn();
  }
}

// Mock Notification
export class Notification {
  constructor(options) {
    this.options = options;
    this.show = vi.fn();
    this.close = vi.fn();
    this.on = vi.fn();
  }

  static isSupported = vi.fn(() => true);
}

// Mock screen
export const mockScreen = {
  getAllDisplays: vi.fn(() => [
    {
      id: 1,
      bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      workArea: { x: 0, y: 0, width: 1920, height: 1040 },
      scaleFactor: 1,
      rotation: 0,
    },
  ]),
  getPrimaryDisplay: vi.fn(() => ({
    id: 1,
    bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    workArea: { x: 0, y: 0, width: 1920, height: 1040 },
    scaleFactor: 1,
    rotation: 0,
  })),
  getDisplayMatching: vi.fn(() => ({
    id: 1,
    bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    workArea: { x: 0, y: 0, width: 1920, height: 1040 },
    scaleFactor: 1,
    rotation: 0,
  })),
  getCursorScreenPoint: vi.fn(() => ({ x: 0, y: 0 })),
  on: vi.fn(),
};

// Mock safeStorage
export const mockSafeStorage = {
  isEncryptionAvailable: vi.fn(() => true),
  encryptString: vi.fn((str) => Buffer.from(str)),
  decryptString: vi.fn((buf) => buf.toString()),
};

// Complete Electron mock object
export const mockElectron = {
  app: mockApp,
  BrowserWindow,
  dialog: mockDialog,
  ipcMain: mockIpcMain,
  ipcRenderer: mockIpcRenderer,
  session: mockSession,
  shell: mockShell,
  Menu: mockMenu,
  Tray,
  Notification,
  Notification,
  screen: mockScreen,
  safeStorage: mockSafeStorage,
};

// ============================================================================
// Electron Renderer Process Mocks (window.electronAPI)
// ============================================================================

export const mockElectronAPI = {
  // Window API
  window: {
    create: vi.fn((_type, _options) => Promise.resolve({ success: true, windowId: 1 })),
    close: vi.fn((_windowId) => Promise.resolve({ success: true })),
    minimize: vi.fn(() => Promise.resolve({ success: true })),
    maximize: vi.fn(() => Promise.resolve({ success: true, maximized: true })),
    getState: vi.fn(() => Promise.resolve({
      success: true,
      isMaximized: false,
      isVisible: true,
      bounds: { x: 0, y: 0, width: 800, height: 600 }
    })),
  },

  // Dialog API
  dialog: {
    showOpenDialog: vi.fn((_options) => Promise.resolve('/mock/file.txt')),
    showSaveDialog: vi.fn((_options) => Promise.resolve('/mock/save.txt')),
    openFile: vi.fn((_options) => Promise.resolve({
      canceled: false,
      filePath: '/mock/file.txt',
      content: 'mock content'
    })),
    saveFile: vi.fn((_options, _content) => Promise.resolve({
      canceled: false,
      filePath: '/mock/save.txt'
    })),
    message: vi.fn((_options) => Promise.resolve({
      success: true,
      response: 0
    })),
    error: vi.fn((_options) => Promise.resolve({
      success: true
    })),
  },

  // Store API
  store: {
    get: vi.fn((_key) => Promise.resolve(null)),
    set: vi.fn((_key, _value) => Promise.resolve({ success: true })),
    delete: vi.fn((_key) => Promise.resolve({ success: true })),
    has: vi.fn((_key) => Promise.resolve(false)),
    clear: vi.fn(() => Promise.resolve({ success: true })),
  },

  // Secure Store API
  secureStore: {
    get: vi.fn((_key) => Promise.resolve(null)),
    set: vi.fn((_key, _value) => Promise.resolve({ success: true })),
    delete: vi.fn((_key) => Promise.resolve({ success: true })),
    has: vi.fn((_key) => Promise.resolve(false)),
    isAvailable: vi.fn(() => Promise.resolve(true)),
  },

  // File API
  file: {
    validatePath: vi.fn((_path) => Promise.resolve({ success: true, valid: true })),
  },

  // i18n API
  i18n: {
    getLanguage: vi.fn(() => Promise.resolve({ success: true, language: 'en' })),
    changeLanguage: vi.fn((_lng) => Promise.resolve({ success: true })),
  },

  // Data API
  data: {
    createBackup: vi.fn((_options) => Promise.resolve({ success: true, filename: 'backup.json' })),
    listBackups: vi.fn(() => Promise.resolve({ success: true, backups: [] })),
    restoreBackup: vi.fn((_options) => Promise.resolve({ success: true })),
    deleteBackup: vi.fn((_options) => Promise.resolve({ success: true })),
    validateBackup: vi.fn((_options) => Promise.resolve({ success: true, valid: true })),
    export: vi.fn((_options) => Promise.resolve({ success: true, path: '/mock/export.json' })),
    import: vi.fn((_options) => Promise.resolve({ success: true })),
    watchPath: vi.fn((_options) => Promise.resolve({ success: true })),
    unwatchPath: vi.fn((_options) => Promise.resolve({ success: true })),
    getSyncStats: vi.fn(() => Promise.resolve({ pending: 0, synced: 0, failed: 0 })),
    triggerSync: vi.fn(() => Promise.resolve({ success: true })),
    clearSyncQueue: vi.fn(() => Promise.resolve({ success: true })),
    getConnectivityStatus: vi.fn(() => Promise.resolve({ success: true, online: true, lastCheck: Date.now() })),
    onConnectivityChanged: vi.fn((_callback) => {
      return () => { };
    }),
  },

  // System API
  system: {
    getPlatform: vi.fn(() => Promise.resolve({ platform: 'darwin', arch: 'x64' })),
  },

  // App API
  app: {
    getVersion: vi.fn(() => Promise.resolve({
      app: '1.0.0',
      electron: '28.0.0',
      chrome: '120.0.0',
      node: '18.0.0',
      v8: '12.0.0'
    })),
    getPath: vi.fn((name) => Promise.resolve(`/mock/path/${name}`)),
    quit: vi.fn(() => Promise.resolve({ success: true })),
    relaunch: vi.fn(() => Promise.resolve({ success: true })),
  },

  // Events API
  events: {
    onUpdateAvailable: vi.fn((_callback) => {
      // Return cleanup function
      return () => { };
    }),
    onUpdateDownloaded: vi.fn((_callback) => {
      // Return cleanup function
      return () => { };
    }),
    onUpdateProgress: vi.fn((_callback) => {
      // Return cleanup function
      return () => { };
    }),
    onUpdateError: vi.fn((_callback) => {
      // Return cleanup function
      return () => { };
    }),
    onMenuAction: vi.fn((_callback) => {
      return () => { };
    }),
  },

  // Update API
  update: {
    check: vi.fn(() => Promise.resolve({ success: true })),
    quitAndInstall: vi.fn(() => Promise.resolve({ success: true })),
  },

  // Tray API
  tray: {
    show: vi.fn(() => Promise.resolve({ success: true })),
    hide: vi.fn(() => Promise.resolve({ success: true })),
    setIcon: vi.fn((_iconPath) => Promise.resolve({ success: true })),
    setTooltip: vi.fn((_tooltip) => Promise.resolve({ success: true })),
    setMenu: vi.fn((_menuTemplate) => Promise.resolve({ success: true })),
    onMenuItemClick: vi.fn((_callback) => {
      return () => { };
    }),
  },

  // Shortcuts API
  shortcuts: {
    register: vi.fn((_accelerator, _description) => Promise.resolve({ success: true })),
    unregister: vi.fn((_accelerator) => Promise.resolve({ success: true })),
    unregisterAll: vi.fn(() => Promise.resolve({ success: true })),
    isRegistered: vi.fn((_accelerator) => Promise.resolve(false)),
    listActive: vi.fn(() => Promise.resolve([])),
    onTriggered: vi.fn((_callback) => {
      return () => { };
    }),
  },

  // Progress API
  progress: {
    set: vi.fn((_value, _options) => Promise.resolve({ success: true })),
    clear: vi.fn((_windowId) => Promise.resolve({ success: true })),
  },

  // Recent Documents API
  recentDocs: {
    add: vi.fn((_filePath) => Promise.resolve({ success: true })),
    clear: vi.fn(() => Promise.resolve({ success: true })),
  },

  // Notifications API
  notifications: {
    show: vi.fn((_options) => Promise.resolve({ success: true, id: 'notif_123' })),
    close: vi.fn((_id) => Promise.resolve({ success: true })),
    getHistory: vi.fn((_limit) => Promise.resolve([])),
    onClicked: vi.fn((_callback) => {
      return () => { };
    }),
    onActionClicked: vi.fn((_callback) => {
      return () => { };
    }),
    onClosed: vi.fn((_callback) => {
      return () => { };
    }),
  },

  // Deep Link API
  deepLink: {
    onReceived: vi.fn((_callback) => {
      return () => { };
    }),
  },

  // Log API
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },

  // Backward compatibility methods (deprecated, to be removed)
  setTitle: vi.fn(() => Promise.resolve()),
  openFile: vi.fn(() => Promise.resolve({ canceled: false, filePath: '/mock/file.txt', content: 'mock content' })),
  saveFile: vi.fn(() => Promise.resolve({ canceled: false, filePath: '/mock/save.txt' })),
  invoke: vi.fn(() => Promise.resolve({ success: true })),
};
