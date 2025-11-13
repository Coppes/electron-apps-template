import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './common/constants.js';

/**
 * Preload script - Exposes a secure, type-safe API to the renderer process
 * Uses contextBridge for context isolation and ipcRenderer for IPC communication
 */

/**
 * Window management API
 */
const windowAPI = {
  /**
   * Create a new window
   * @param {string} type - Window type (main, settings, about)
   * @param {Object} [options] - Window options
   * @returns {Promise<Object>} Result with windowId
   */
  create: (type, options) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CREATE, { type, options }),

  /**
   * Close a window
   * @param {number} windowId - Window ID to close
   * @returns {Promise<Object>} Result
   */
  close: (windowId) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE, { windowId }),

  /**
   * Minimize current window
   * @returns {Promise<Object>} Result
   */
  minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE, {}),

  /**
   * Maximize/unmaximize current window
   * @returns {Promise<Object>} Result with maximized state
   */
  maximize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE, {}),

  /**
   * Get current window state
   * @returns {Promise<Object>} Window state (position, size, maximized, etc.)
   */
  getState: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_GET_STATE, {}),
};

/**
 * Store/persistence API
 */
const storeAPI = {
  /**
   * Get value from store
   * @param {string} key - Key to retrieve
   * @returns {Promise<*>} Stored value
   */
  get: (key) => ipcRenderer.invoke(IPC_CHANNELS.STORE_GET, { key }).then(r => r.value),

  /**
   * Set value in store
   * @param {string} key - Key to store
   * @param {*} value - Value to store
   * @returns {Promise<Object>} Result
   */
  set: (key, value) => ipcRenderer.invoke(IPC_CHANNELS.STORE_SET, { key, value }),

  /**
   * Delete key from store
   * @param {string} key - Key to delete
   * @returns {Promise<Object>} Result
   */
  delete: (key) => ipcRenderer.invoke(IPC_CHANNELS.STORE_DELETE, { key }),

  /**
   * Clear entire store
   * @returns {Promise<Object>} Result
   */
  clear: () => ipcRenderer.invoke(IPC_CHANNELS.STORE_CLEAR, {}),

  /**
   * Check if key exists in store
   * @param {string} key - Key to check
   * @returns {Promise<boolean>} True if key exists
   */
  has: (key) => ipcRenderer.invoke(IPC_CHANNELS.STORE_HAS, { key }).then(r => r.exists),
};

/**
 * Secure Store API - Encrypted storage for sensitive data
 */
const secureStoreAPI = {
  /**
   * Store an encrypted value
   * @param {string} key - Storage key
   * @param {*} value - Value to encrypt and store
   * @returns {Promise<Object>} Result with success status
   */
  set: (key, value) => ipcRenderer.invoke(IPC_CHANNELS.SECURE_STORE_SET, { key, value }),

  /**
   * Retrieve and decrypt a value
   * @param {string} key - Storage key
   * @returns {Promise<*>} Decrypted value or null if not found
   */
  get: (key) => ipcRenderer.invoke(IPC_CHANNELS.SECURE_STORE_GET, { key }),

  /**
   * Delete an encrypted value
   * @param {string} key - Storage key
   * @returns {Promise<Object>} Result with success status
   */
  delete: (key) => ipcRenderer.invoke(IPC_CHANNELS.SECURE_STORE_DELETE, { key }),

  /**
   * Check if an encrypted value exists
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} True if the key exists
   */
  has: (key) => ipcRenderer.invoke(IPC_CHANNELS.SECURE_STORE_HAS, { key }),

  /**
   * Check if encryption is available on this platform
   * @returns {Promise<boolean>} True if encryption is available
   */
  isAvailable: () => ipcRenderer.invoke(IPC_CHANNELS.SECURE_STORE_IS_AVAILABLE, {}),
};

/**
 * Dialog API
 */
const dialogAPI = {
  /**
   * Open file dialog and read content
   * @param {Object} [options] - Dialog options
   * @returns {Promise<Object>} Result with filePath and content
   */
  openFile: (options) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE, { options }),

  /**
   * Save file dialog and write content
   * @param {Object} options - Dialog options
   * @param {string} content - Content to save
   * @returns {Promise<Object>} Result with filePath
   */
  saveFile: (options, content) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SAVE_FILE, { options, content }),

  /**
   * Show message dialog
   * @param {Object} options - Dialog options (type, title, message, buttons, etc.)
   * @returns {Promise<Object>} Result with response index
   */
  message: (options) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_MESSAGE, { options }),

  /**
   * Show error dialog
   * @param {string} title - Error title
   * @param {string} content - Error content
   * @returns {Promise<Object>} Result
   */
  error: (title, content) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_ERROR, { title, content }),
};

/**
 * App info API
 */
const appAPI = {
  /**
   * Get version information
   * @returns {Promise<Object>} Version info (electron, chrome, node, v8, app)
   */
  getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION, {}),

  /**
   * Get app path
   * @param {string} name - Path name (userData, appData, temp, etc.)
   * @returns {Promise<string>} Path
   */
  getPath: (name) => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_PATH, { name }).then(r => r.path),

  /**
   * Quit application
   * @returns {Promise<Object>} Result
   */
  quit: () => ipcRenderer.invoke(IPC_CHANNELS.APP_QUIT, {}),

  /**
   * Relaunch application
   * @returns {Promise<Object>} Result
   */
  relaunch: () => ipcRenderer.invoke(IPC_CHANNELS.APP_RELAUNCH, {}),

  /**
   * Check for updates
   * @returns {Promise<Object>} Result with update availability
   */
  checkForUpdates: () => ipcRenderer.invoke(IPC_CHANNELS.APP_CHECK_FOR_UPDATES, {}),

  /**
   * Install update and restart
   * @returns {Promise<Object>} Result
   */
  installUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.APP_INSTALL_UPDATE, {}),
};

/**
 * System info API
 */
const systemAPI = {
  /**
   * Get platform information
   * @returns {Promise<Object>} Platform info (platform, arch)
   */
  getPlatform: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_PLATFORM, {}),
};

/**
 * Event listeners API
 */
const eventsAPI = {
  /**
   * Register listener for counter updates (legacy compatibility)
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function to remove listener
   */
  onUpdateCounter: (callback) => {
    const listener = (event, count) => callback(count);
    ipcRenderer.on(IPC_CHANNELS.COUNTER_UPDATED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.COUNTER_UPDATED, listener);
  },

  /**
   * Register listener for update available
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onUpdateAvailable: (callback) => {
    const listener = (event, info) => callback(info);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_AVAILABLE, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_AVAILABLE, listener);
  },

  /**
   * Register listener for update downloaded
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onUpdateDownloaded: (callback) => {
    const listener = (event, info) => callback(info);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_DOWNLOADED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_DOWNLOADED, listener);
  },

  /**
   * Register listener for update progress
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onUpdateProgress: (callback) => {
    const listener = (event, progress) => callback(progress);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_PROGRESS, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_PROGRESS, listener);
  },

  /**
   * Register listener for update error
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onUpdateError: (callback) => {
    const listener = (event, error) => callback(error);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_ERROR, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_ERROR, listener);
  },
};

/**
 * Logging API - Forwards logs to main process
 */
const logAPI = {
  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   * @returns {Promise<Object>} Result
   */
  debug: (message, meta = {}) => ipcRenderer.invoke(IPC_CHANNELS.LOG_DEBUG, { message, meta }),

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   * @returns {Promise<Object>} Result
   */
  info: (message, meta = {}) => ipcRenderer.invoke(IPC_CHANNELS.LOG_INFO, { message, meta }),

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   * @returns {Promise<Object>} Result
   */
  warn: (message, meta = {}) => ipcRenderer.invoke(IPC_CHANNELS.LOG_WARN, { message, meta }),

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   * @returns {Promise<Object>} Result
   */
  error: (message, meta = {}) => ipcRenderer.invoke(IPC_CHANNELS.LOG_ERROR, { message, meta }),
};

/**
 * File operations API
 */
const fileAPI = {
  /**
   * Process dropped files
   * @param {Array<string>} filePaths - Array of file paths
   * @param {Object} [options] - Validation options
   * @returns {Promise<Object>} Result with valid/invalid files
   */
  drop: (filePaths, options) => ipcRenderer.invoke(IPC_CHANNELS.FILE_DROP, { filePaths, options }),

  /**
   * Start drag operation from app
   * @param {string} filePath - File path to drag
   * @param {string} [icon] - Optional drag icon path
   * @returns {Promise<Object>} Result
   */
  dragStart: (filePath, icon) => ipcRenderer.invoke(IPC_CHANNELS.FILE_DRAG_START, { filePath, icon }),

  /**
   * Validate file path
   * @param {string} filePath - Path to validate
   * @param {Object} [options] - Validation options
   * @returns {Promise<Object>} Result with metadata
   */
  validatePath: (filePath, options) => ipcRenderer.invoke(IPC_CHANNELS.FILE_VALIDATE_PATH, { filePath, options }),
};

/**
 * Data management API (backup/restore)
 */
const dataAPI = {
  /**
   * Create a backup
   * @param {Object} [options] - Backup options (type, includeDatabase)
   * @returns {Promise<Object>} Result with backup info
   */
  createBackup: (options) => ipcRenderer.invoke(IPC_CHANNELS.DATA_CREATE_BACKUP, options),

  /**
   * List all backups
   * @returns {Promise<Object>} Result with backups array
   */
  listBackups: () => ipcRenderer.invoke(IPC_CHANNELS.DATA_LIST_BACKUPS, {}),

  /**
   * Restore from backup
   * @param {string} filename - Backup filename
   * @returns {Promise<Object>} Result
   */
  restoreBackup: (filename) => ipcRenderer.invoke(IPC_CHANNELS.DATA_RESTORE_BACKUP, { filename }),

  /**
   * Delete a backup
   * @param {string} filename - Backup filename
   * @returns {Promise<Object>} Result
   */
  deleteBackup: (filename) => ipcRenderer.invoke(IPC_CHANNELS.DATA_DELETE_BACKUP, { filename }),
};

/**
 * Complete Electron API surface exposed to renderer
 */
const electronAPI = {
  window: windowAPI,
  store: storeAPI,
  secureStore: secureStoreAPI,
  dialog: dialogAPI,
  app: appAPI,
  system: systemAPI,
  events: eventsAPI,
  log: logAPI,
  file: fileAPI,
  data: dataAPI,

  // Legacy compatibility - will be deprecated
  setTitle: (title) => windowAPI.getState().then(() => title),
  getVersion: appAPI.getVersion,
  openFile: dialogAPI.openFile,
  onUpdateCounter: eventsAPI.onUpdateCounter,
  
  // Convenience method for accessing IPC directly (for hooks)
  invoke: (channel, payload) => ipcRenderer.invoke(channel, payload),
};

/**
 * Expose the API to the renderer context
 * Object is frozen to prevent modifications from renderer
 */
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Freeze API to prevent tampering
Object.freeze(electronAPI);
Object.freeze(windowAPI);
Object.freeze(storeAPI);
Object.freeze(secureStoreAPI);
Object.freeze(dialogAPI);
Object.freeze(appAPI);
Object.freeze(systemAPI);
Object.freeze(eventsAPI);
Object.freeze(logAPI);
Object.freeze(fileAPI);
Object.freeze(dataAPI);

