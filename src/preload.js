import { contextBridge, ipcRenderer, webUtils } from 'electron';
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

  /**
   * Get display info
   * @returns {Promise<Object>} Display info
   */
  getDisplay: () => ipcRenderer.invoke('window:get-display', {}),
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
   * Show open dialog (returns path only, no content read)
   * @param {Object} [options] - Dialog options
   * @returns {Promise<string|null>} Selected file path or null if canceled
   */
  showOpenDialog: async (options) => {
    const result = await ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE, { options });
    return result.canceled ? null : result.filePath;
  },

  /**
   * Show save dialog (returns path only, no content write)
   * @param {Object} [options] - Dialog options
   * @returns {Promise<string|null>} Selected save path or null if canceled
   */
  showSaveDialog: async (options) => {
    const result = await ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SAVE_FILE, { options, content: '' });
    return result.canceled ? null : result.filePath;
  },

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
   * Get platform information
   * @returns {Promise<Object>} Platform info (platform, arch)
   */
  getPlatform: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_PLATFORM, {}),

  /**
   * Check if app is packaged
   * @returns {Promise<boolean>} True if packaged
   */
  isPackaged: () => ipcRenderer.invoke('app:is-packaged', {}),

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

  /**
   * Listen for menu actions (new tab, command palette, etc.)
   * @param {Function} callback - Callback function receiving (action, data)
   * @returns {Function} Cleanup function
   */
  onMenuAction: (callback) => {
    // We listen to specific channels and normalize them
    const listeners = [];

    const add = (channel, action) => {
      const listener = (event, data) => callback(action, data);
      ipcRenderer.on(channel, listener);
      listeners.push({ channel, listener });
    };

    add('menu:new-tab', 'new-tab');
    add('menu:command-palette', 'command-palette');
    add('menu:show-onboarding', 'show-onboarding');
    add('menu:close-tab', 'close-tab');
    add('menu:data-import', 'data-import');
    add('menu:data-export', 'data-export');

    return () => {
      listeners.forEach(({ channel, listener }) =>
        ipcRenderer.removeListener(channel, listener)
      );
    };
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
   * Get file path from File object (webUtils)
   * @param {File} file - File object
   * @returns {string} File path
   */
  getPath: (file) => webUtils.getPathForFile(file),

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

  /**
   * Start watching a file for changes
   * @param {string} filePath - Path to watch
   * @returns {Promise<Object>} Result
   */
  watchStart: (filePath) => ipcRenderer.invoke(IPC_CHANNELS.FILE_WATCH_START, { filePath }),

  /**
   * Stop watching a file
   * @param {string} filePath - Path to stop watching
   * @returns {Promise<Object>} Result
   */
  watchStop: (filePath) => ipcRenderer.invoke(IPC_CHANNELS.FILE_WATCH_STOP, { filePath }),

  /**
   * Listen for file change events
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onFileChanged: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.FILE_CHANGED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.FILE_CHANGED, listener);
  },
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
   * Validate a backup file
   * @param {string} filename - Backup filename
   * @returns {Promise<Object>} Result
   */
  validateBackup: (filename) => ipcRenderer.invoke('data:validate-backup', { filename }),

  /**
   * Delete a backup
   * @param {string} filename - Backup filename
   * @returns {Promise<Object>} Result
   */
  deleteBackup: (filename) => ipcRenderer.invoke(IPC_CHANNELS.DATA_DELETE_BACKUP, { filename }),

  /**
   * Import data from file
   * @param {string} filePath - Source file path
   * @param {Object} [options] - Import options (format, etc.)
   * @returns {Promise<Object>} Result with imported data
   */
  import: (filePath, options) => ipcRenderer.invoke(IPC_CHANNELS.DATA_IMPORT, { filePath, options }),

  /**
   * Export data to file
   * @param {string} filePath - Destination file path
   * @param {any} data - Data to export
   * @param {Object} [options] - Export options (format, etc.)
   * @returns {Promise<Object>} Result
   */
  export: (filePath, data, options) => ipcRenderer.invoke(IPC_CHANNELS.DATA_EXPORT, { filePath, data, options }),

  /**
   * Export data using a preset
   * @param {string} filePath - Destination file path
   * @param {string} preset - Preset name
   * @param {Object} [options] - Export options
   * @returns {Promise<Object>} Result
   */
  exportPreset: (filePath, preset, options) => ipcRenderer.invoke(IPC_CHANNELS.DATA_EXPORT, { filePath, preset, options }),

  /**
   * List available import/export formats
   * @returns {Promise<Object>} Result with formats array
   */
  listFormats: () => ipcRenderer.invoke(IPC_CHANNELS.DATA_LIST_FORMATS, {}),

  /**
   * Get connectivity status
   * @returns {Promise<Object>} Result with online status
   */
  getConnectivityStatus: () => ipcRenderer.invoke(IPC_CHANNELS.CONNECTIVITY_STATUS, {}),

  /**
   * Listen for connectivity change events
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onConnectivityChanged: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.CONNECTIVITY_STATUS, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.CONNECTIVITY_STATUS, listener);
  },

  /**
   * Add operation to sync queue
   * @param {Object} operation - Operation to queue
   * @returns {Promise<Object>} Result
   */
  syncQueueAdd: (operation) => ipcRenderer.invoke(IPC_CHANNELS.SYNC_QUEUE_ADD, { operation }),

  /**
   * Process sync queue
   * @returns {Promise<Object>} Result with processed count
   */
  syncQueueProcess: () => ipcRenderer.invoke(IPC_CHANNELS.SYNC_QUEUE_PROCESS, {}),

  /**
   * Get sync queue status
   * @returns {Promise<Object>} Result with queue statistics
   */
  syncQueueStatus: () => ipcRenderer.invoke(IPC_CHANNELS.SYNC_QUEUE_STATUS, {}),
  getSyncQueueStatus: () => ipcRenderer.invoke(IPC_CHANNELS.SYNC_QUEUE_STATUS, {}),

  /**
   * Listen for sync status change events
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onSyncStatusChanged: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.SYNC_STATUS_CHANGED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SYNC_STATUS_CHANGED, listener);
  },
};

/**
 * System Tray API
 */
const trayAPI = {
  /**
   * Create tray icon
   * @returns {Promise<Object>} Result
   */
  create: () => ipcRenderer.invoke(IPC_CHANNELS.TRAY_CREATE, {}),

  /**
   * Check if tray is created
   * @returns {Promise<boolean>} True if created
   */
  checkStatus: () => ipcRenderer.invoke(IPC_CHANNELS.TRAY_CHECK_STATUS, {}).then(r => r.created),

  /**
   * Destroy tray icon
   * @returns {Promise<Object>} Result
   */
  destroy: () => ipcRenderer.invoke(IPC_CHANNELS.TRAY_DESTROY, {}),

  /**
   * Show tray icon
   * @returns {Promise<Object>} Result
   */
  show: () => ipcRenderer.invoke(IPC_CHANNELS.TRAY_SHOW, {}),

  /**
   * Hide tray icon
   * @returns {Promise<Object>} Result
   */
  hide: () => ipcRenderer.invoke(IPC_CHANNELS.TRAY_HIDE, {}),

  /**
   * Set tray icon
   * @param {string} iconPath - Path to icon file
   * @returns {Promise<Object>} Result
   */
  setIcon: (iconPath) => ipcRenderer.invoke(IPC_CHANNELS.TRAY_SET_ICON, { iconPath }),

  /**
   * Set tray tooltip
   * @param {string} tooltip - Tooltip text
   * @returns {Promise<Object>} Result
   */
  setTooltip: (tooltip) => ipcRenderer.invoke(IPC_CHANNELS.TRAY_SET_TOOLTIP, { tooltip }),

  /**
   * Set tray context menu
   * @param {import('./common/types.js').TrayMenuItem[]} menuTemplate - Menu template
   * @returns {Promise<Object>} Result
   */
  setContextMenu: (menuTemplate) => ipcRenderer.invoke(IPC_CHANNELS.TRAY_SET_MENU, { menuTemplate }),

  /**
   * Listen for tray menu item clicks
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onMenuItemClick: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.TRAY_MENU_ITEM_CLICKED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TRAY_MENU_ITEM_CLICKED, listener);
  },
};

/**
 * Global Shortcuts API
 */
const shortcutsAPI = {
  /**
   * Register a global shortcut
   * @param {string} accelerator - Keyboard accelerator
   * @param {string} [description] - Shortcut description
   * @returns {Promise<Object>} Result
   */
  register: (accelerator, description) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_REGISTER, { accelerator, description }),

  /**
   * Unregister a global shortcut
   * @param {string} accelerator - Keyboard accelerator
   * @returns {Promise<Object>} Result
   */
  unregister: (accelerator) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_UNREGISTER, { accelerator }),

  /**
   * Unregister all global shortcuts
   * @returns {Promise<Object>} Result
   */
  unregisterAll: () =>
    ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_UNREGISTER_ALL, {}),

  /**
   * Check if shortcut is registered
   * @param {string} accelerator - Keyboard accelerator
   * @returns {Promise<boolean>} True if registered
   */
  isRegistered: (accelerator) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_IS_REGISTERED, { accelerator }).then(r => r.registered),

  /**
   * List all active shortcuts
   * @returns {Promise<import('./common/types.js').ShortcutInfo[]>} Active shortcuts
   */
  listActive: () =>
    ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_LIST_ACTIVE, {}).then(r => r.shortcuts),

  /**
   * Listen for shortcut triggers
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onTriggered: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.SHORTCUT_TRIGGERED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SHORTCUT_TRIGGERED, listener);
  },
};

/**
 * Progress Indicator API
 */
const progressAPI = {
  /**
   * Set progress indicator
   * @param {number} value - Progress value (0.0-1.0 or -1 for indeterminate)
   * @param {Object} [options] - Progress options
   * @returns {Promise<Object>} Result
   */
  set: (value, options = {}) =>
    ipcRenderer.invoke(IPC_CHANNELS.PROGRESS_SET, { value, ...options }),

  /**
   * Clear progress indicator
   * @param {number} [windowId] - Window ID
   * @returns {Promise<Object>} Result
   */
  clear: (windowId) =>
    ipcRenderer.invoke(IPC_CHANNELS.PROGRESS_CLEAR, { windowId }),
};

/**
 * Recent Documents API
 */
const recentDocsAPI = {
  /**
   * Add document to recent documents
   * @param {string} filePath - Absolute path to document
   * @returns {Promise<Object>} Result
   */
  add: (filePath) =>
    ipcRenderer.invoke(IPC_CHANNELS.RECENT_DOCS_ADD, { filePath }),

  /**
   * Clear all recent documents
   * @returns {Promise<Object>} Result
   */
  clear: () =>
    ipcRenderer.invoke(IPC_CHANNELS.RECENT_DOCS_CLEAR, {}),
};

/**
 * Native Notifications API
 */
const notificationsAPI = {
  /**
   * Show a native notification
   * @param {import('./common/types.js').NotificationOptions} options - Notification options
   * @returns {Promise<Object>} Result with notification ID
   */
  show: (options) =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_SHOW, options),

  /**
   * Close a notification
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Result
   */
  close: (id) =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_CLOSE, { id }),

  /**
   * Get notification history
   * @param {number} [limit=50] - Maximum number of entries
   * @returns {Promise<import('./common/types.js').NotificationInfo[]>} Notification history
   */
  getHistory: (limit = 50) =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_GET_HISTORY, { limit }).then(r => r.history),

  /**
   * Check if notifications are allowed
   * @returns {Promise<boolean>} True if allowed
   */
  checkPermission: () =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_CHECK_PERMISSION, {}).then(r => r.allowed),

  /**
   * Request notification permission
   * @returns {Promise<boolean>} True if granted
   */
  requestPermission: () =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_REQUEST_PERMISSION, {}).then(r => r.granted),

  /**
   * Listen for notification clicks
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onClick: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.NOTIFICATION_CLICKED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NOTIFICATION_CLICKED, listener);
  },

  /**
   * Listen for notification action clicks
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onAction: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.NOTIFICATION_ACTION_CLICKED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NOTIFICATION_ACTION_CLICKED, listener);
  },

  /**
   * Listen for notification close events
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onClose: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.NOTIFICATION_CLOSED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NOTIFICATION_CLOSED, listener);
  },
};

/**
 * Deep Linking API
 */
const deepLinkAPI = {
  /**
   * Listen for deep link events
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function
   */
  onReceived: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.DEEP_LINK_RECEIVED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.DEEP_LINK_RECEIVED, listener);
  },
};

/**
 * I18n API
 */
const i18nAPI = {
  /**
   * Set application language
   * @param {string} language - Language code (e.g. 'en', 'pt-BR')
   * @returns {Promise<Object>} Result
   */
  changeLanguage: (language) => ipcRenderer.invoke(IPC_CHANNELS.I18N_SET_LANGUAGE, { language }),

  /**
   * Get current application language
   * @returns {Promise<Object>} Result with language
   */
  getLanguage: () => ipcRenderer.invoke(IPC_CHANNELS.I18N_GET_LANGUAGE, {}),
};

/**
 * Plugins API
 */
const pluginsAPI = {
  getAll: () => ipcRenderer.invoke(IPC_CHANNELS.PLUGINS_GET_ALL).then(r => r.plugins || []),
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
  tray: trayAPI,
  shortcuts: shortcutsAPI,
  progress: progressAPI,
  recentDocs: recentDocsAPI,
  notifications: notificationsAPI,
  deepLink: deepLinkAPI,
  deepLink: deepLinkAPI,
  i18n: i18nAPI,
  plugins: pluginsAPI,

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

// Expose Plugin Registry API
contextBridge.exposeInMainWorld('appPlugin', {
  registerCommand: (command) => {
    // Dispatch event so React context can pick it up
    window.dispatchEvent(new CustomEvent('plugin-register-command', { detail: command }));
  }
});

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
Object.freeze(trayAPI);
Object.freeze(shortcutsAPI);
Object.freeze(progressAPI);
Object.freeze(recentDocsAPI);
Object.freeze(notificationsAPI);
Object.freeze(deepLinkAPI);
Object.freeze(i18nAPI);

