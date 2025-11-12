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
    return () => {};
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
  screen: mockScreen,
};

// ============================================================================
// Electron Renderer Process Mocks (window.electronAPI)
// ============================================================================

export const mockElectronAPI = {
  // Window methods
  setTitle: vi.fn(() => Promise.resolve()),
  minimizeWindow: vi.fn(() => Promise.resolve()),
  maximizeWindow: vi.fn(() => Promise.resolve()),
  closeWindow: vi.fn(() => Promise.resolve()),
  
  // File operations
  openFile: vi.fn(() => Promise.resolve({ canceled: false, filePath: '/mock/file.txt', content: 'mock content' })),
  saveFile: vi.fn(() => Promise.resolve({ canceled: false, filePath: '/mock/save.txt' })),
  
  // App info
  getAppVersion: vi.fn(() => Promise.resolve('1.0.0')),
  getAppPath: vi.fn((name) => Promise.resolve(`/mock/path/${name}`)),
  
  // Store operations
  store: {
    get: vi.fn((key, defaultValue) => Promise.resolve(defaultValue)),
    set: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
    has: vi.fn(() => Promise.resolve(false)),
    clear: vi.fn(() => Promise.resolve()),
  },
  
  // Events
  events: {
    onUpdateAvailable: vi.fn((_callback) => {
      // Return cleanup function
      return () => {};
    }),
    onUpdateDownloaded: vi.fn((_callback) => {
      // Return cleanup function
      return () => {};
    }),
    onUpdateProgress: vi.fn((_callback) => {
      // Return cleanup function
      return () => {};
    }),
    onUpdateError: vi.fn((_callback) => {
      // Return cleanup function
      return () => {};
    }),
  },
  
  // Update methods
  checkForUpdates: vi.fn(() => Promise.resolve()),
  quitAndInstall: vi.fn(() => Promise.resolve()),
};
