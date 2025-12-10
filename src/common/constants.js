/**
 * Common constants shared between main and renderer processes
 */

// IPC Channel Names
export const IPC_CHANNELS = {
  // Window Management
  WINDOW_CREATE: 'window:create',
  WINDOW_CLOSE: 'window:close',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_FOCUS: 'window:focus',
  WINDOW_GET_STATE: 'window:get-state',

  // Store/Persistence
  STORE_GET: 'store:get',
  STORE_SET: 'store:set',
  STORE_DELETE: 'store:delete',
  STORE_CLEAR: 'store:clear',
  STORE_HAS: 'store:has',

  // Secure Store (Encrypted Storage)
  SECURE_STORE_SET: 'secure-store:set',
  SECURE_STORE_GET: 'secure-store:get',
  SECURE_STORE_DELETE: 'secure-store:delete',
  SECURE_STORE_HAS: 'secure-store:has',
  SECURE_STORE_IS_AVAILABLE: 'secure-store:is-available',

  // File Operations (Drag and Drop)
  FILE_DROP: 'file:drop',
  FILE_DRAG_START: 'file:drag-start',
  FILE_VALIDATE_PATH: 'file:validate-path',

  // Data Management (Backup/Restore)
  DATA_CREATE_BACKUP: 'data:create-backup',
  DATA_LIST_BACKUPS: 'data:list-backups',
  DATA_RESTORE_BACKUP: 'data:restore-backup',
  DATA_DELETE_BACKUP: 'data:delete-backup',

  // Data Management (Import/Export)
  DATA_IMPORT: 'data:import',
  DATA_EXPORT: 'data:export',
  DATA_LIST_FORMATS: 'data:list-formats',

  // File Watching
  FILE_WATCH_START: 'file:watch-start',
  FILE_WATCH_STOP: 'file:watch-stop',
  FILE_CHANGED: 'file:changed',

  // Connectivity & Sync
  CONNECTIVITY_STATUS: 'connectivity:status',
  SYNC_QUEUE_ADD: 'sync:queue-add',
  SYNC_QUEUE_PROCESS: 'sync:queue-process',
  SYNC_QUEUE_STATUS: 'sync:queue-status',
  SYNC_STATUS_CHANGED: 'sync:status-changed',

  // Dialog
  DIALOG_OPEN_FILE: 'dialog:open-file',
  DIALOG_SAVE_FILE: 'dialog:save-file',
  DIALOG_MESSAGE: 'dialog:message',
  DIALOG_ERROR: 'dialog:error',

  // App Info
  APP_GET_VERSION: 'app:get-version',
  APP_GET_PATH: 'app:get-path',
  APP_QUIT: 'app:quit',
  APP_RELAUNCH: 'app:relaunch',
  APP_CHECK_FOR_UPDATES: 'app:check-for-updates',
  APP_INSTALL_UPDATE: 'app:install-update',

  // System
  SYSTEM_GET_PLATFORM: 'system:get-platform',

  // Events (main to renderer)
  COUNTER_UPDATED: 'counter:updated',
  UPDATE_AVAILABLE: 'update:available',
  UPDATE_DOWNLOADED: 'update:downloaded',
  UPDATE_ERROR: 'update:error',
  UPDATE_PROGRESS: 'update:progress',

  // Logging
  LOG_DEBUG: 'log:debug',
  LOG_INFO: 'log:info',
  LOG_WARN: 'log:warn',
  LOG_ERROR: 'log:error',

  // System Tray
  TRAY_CREATE: 'tray:create',
  TRAY_DESTROY: 'tray:destroy',
  TRAY_SHOW: 'tray:show',
  TRAY_HIDE: 'tray:hide',
  TRAY_SET_ICON: 'tray:set-icon',
  TRAY_SET_TOOLTIP: 'tray:set-tooltip',
  TRAY_SET_MENU: 'tray:set-menu',
  TRAY_CLICKED: 'tray:clicked',
  TRAY_MENU_ITEM_CLICKED: 'tray:menu-item-clicked',

  // Global Shortcuts
  SHORTCUT_REGISTER: 'shortcut:register',
  SHORTCUT_UNREGISTER: 'shortcut:unregister',
  SHORTCUT_UNREGISTER_ALL: 'shortcut:unregister-all',
  SHORTCUT_IS_REGISTERED: 'shortcut:is-registered',
  SHORTCUT_LIST_ACTIVE: 'shortcut:list-active',
  SHORTCUT_TRIGGERED: 'shortcut:triggered',

  // Progress Indicator
  PROGRESS_SET: 'progress:set',
  PROGRESS_CLEAR: 'progress:clear',

  // Recent Documents
  RECENT_DOCS_ADD: 'recent-docs:add',
  RECENT_DOCS_CLEAR: 'recent-docs:clear',

  // Native Notifications
  NOTIFICATION_SHOW: 'notification:show',
  NOTIFICATION_CLOSE: 'notification:close',
  NOTIFICATION_GET_HISTORY: 'notification:get-history',
  NOTIFICATION_CLICKED: 'notification:clicked',
  NOTIFICATION_ACTION_CLICKED: 'notification:action-clicked',
  NOTIFICATION_CLOSED: 'notification:closed',

  // i18n
  I18N_SET_LANGUAGE: 'i18n:set-language',
  I18N_GET_LANGUAGE: 'i18n:get-language',

  // Deep Linking (Enhanced Protocol Handler)
  DEEP_LINK_RECEIVED: 'deep-link:received',
};

// Window Types
export const WINDOW_TYPES = {
  MAIN: 'main',
  SETTINGS: 'settings',
  ABOUT: 'about',
  SPLASH: 'splash',
};

// Default Window Configurations
export const DEFAULT_WINDOW_CONFIG = {
  [WINDOW_TYPES.MAIN]: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Electron App',
  },
  [WINDOW_TYPES.SETTINGS]: {
    width: 600,
    height: 500,
    minWidth: 500,
    minHeight: 400,
    title: 'Settings',
    resizable: true,
  },
  [WINDOW_TYPES.ABOUT]: {
    width: 400,
    height: 350,
    minWidth: 400,
    minHeight: 350,
    maxWidth: 400,
    maxHeight: 350,
    title: 'About',
    resizable: false,
  },
  [WINDOW_TYPES.SPLASH]: {
    width: 300,
    height: 300,
    minWidth: 300,
    minHeight: 300,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    center: true,
    title: 'Splash',
    skipTaskbar: true,
  },
};

// Log Levels
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

// Environment
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
};

// App Protocol
export const APP_PROTOCOL = 'electronapp';

// Paths
export const PATHS = {
  USER_DATA: 'userData',
  APP_DATA: 'appData',
  TEMP: 'temp',
  LOGS: 'logs',
};

// Test Mode
export const TEST_MODE = {
  ENABLED: 'test',
};

// Progress States
export const PROGRESS_STATE = {
  NORMAL: 'normal',
  PAUSED: 'paused',
  ERROR: 'error',
  INDETERMINATE: 'indeterminate',
};

// Platform Detection
export const PLATFORM = {
  MACOS: 'darwin',
  WINDOWS: 'win32',
  LINUX: 'linux',
};

/**
 * Check if running on macOS
 * @returns {boolean}
 */
export function isMacOS() {
  return process.platform === PLATFORM.MACOS;
}

/**
 * Check if running on Windows
 * @returns {boolean}
 */
export function isWindows() {
  return process.platform === PLATFORM.WINDOWS;
}

/**
 * Check if running on Linux
 * @returns {boolean}
 */
export function isLinux() {
  return process.platform === PLATFORM.LINUX;
}

// Freeze all constants to prevent modification
Object.freeze(IPC_CHANNELS);
Object.freeze(WINDOW_TYPES);
Object.freeze(DEFAULT_WINDOW_CONFIG);
Object.freeze(DEFAULT_WINDOW_CONFIG[WINDOW_TYPES.MAIN]);
Object.freeze(DEFAULT_WINDOW_CONFIG[WINDOW_TYPES.SETTINGS]);
Object.freeze(DEFAULT_WINDOW_CONFIG[WINDOW_TYPES.ABOUT]);
Object.freeze(LOG_LEVELS);
Object.freeze(ENV);
Object.freeze(PATHS);
Object.freeze(TEST_MODE);
Object.freeze(PROGRESS_STATE);
Object.freeze(PLATFORM);
