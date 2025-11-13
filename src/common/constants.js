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
  COUNTER_UPDATED: 'counter-updated',
  UPDATE_AVAILABLE: 'update:available',
  UPDATE_DOWNLOADED: 'update:downloaded',
  UPDATE_ERROR: 'update:error',
  UPDATE_PROGRESS: 'update:progress',
  
  // Logging
  LOG_DEBUG: 'log:debug',
  LOG_INFO: 'log:info',
  LOG_WARN: 'log:warn',
  LOG_ERROR: 'log:error',
};

// Window Types
export const WINDOW_TYPES = {
  MAIN: 'main',
  SETTINGS: 'settings',
  ABOUT: 'about',
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
