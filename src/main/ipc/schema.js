import { IPC_CHANNELS } from '../../common/constants.js';

/**
 * IPC Schema definitions for type-safe communication
 * Each channel includes input/output validation schemas
 */

/**
 * Window management handlers
 */
export const windowSchema = {
  [IPC_CHANNELS.WINDOW_CREATE]: {
    input: {
      type: { type: 'string', required: true },
      options: { type: 'object', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
      windowId: { type: 'number', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.WINDOW_CLOSE]: {
    input: {
      windowId: { type: 'number', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
    },
  },

  [IPC_CHANNELS.WINDOW_MINIMIZE]: {
    input: {
      windowId: { type: 'number', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
    },
  },

  [IPC_CHANNELS.WINDOW_MAXIMIZE]: {
    input: {
      windowId: { type: 'number', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
    },
  },

  [IPC_CHANNELS.WINDOW_GET_STATE]: {
    input: {
      windowId: { type: 'number', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
      state: { type: 'object', required: false },
    },
  },

  'window:get-display': {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
      display: { type: 'object', required: false },
      error: { type: 'string', required: false },
    },
  },
};

/**
 * Progress handlers
 */
export const progressSchema = {
  [IPC_CHANNELS.PROGRESS_SET]: {
    input: {
      value: { type: 'number', required: true },
      windowId: { type: 'number', required: false },
      state: { type: 'string', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.PROGRESS_CLEAR]: {
    input: {
      windowId: { type: 'number', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },
};

/**
 * Store/persistence handlers
 */
export const storeSchema = {
  [IPC_CHANNELS.STORE_GET]: {
    input: {
      key: { type: 'string', required: true },
    },
    output: {
      value: { type: 'any', required: false },
    },
  },

  [IPC_CHANNELS.STORE_SET]: {
    input: {
      key: { type: 'string', required: true },
      value: { type: 'any', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
    },
  },

  [IPC_CHANNELS.STORE_DELETE]: {
    input: {
      key: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
    },
  },

  [IPC_CHANNELS.STORE_CLEAR]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
    },
  },

  [IPC_CHANNELS.STORE_HAS]: {
    input: {
      key: { type: 'string', required: true },
    },
    output: {
      exists: { type: 'boolean', required: true },
    },
  },
};

/**
 * Dialog handlers
 */
export const dialogSchema = {
  [IPC_CHANNELS.DIALOG_OPEN_FILE]: {
    input: {
      options: { type: 'object', required: false },
    },
    output: {
      canceled: { type: 'boolean', required: true },
      filePath: { type: 'string', required: false },
      content: { type: 'string', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.DIALOG_SAVE_FILE]: {
    input: {
      options: { type: 'object', required: false },
      content: { type: 'string', required: true },
    },
    output: {
      canceled: { type: 'boolean', required: true },
      filePath: { type: 'string', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.DIALOG_MESSAGE]: {
    input: {
      options: { type: 'object', required: true },
    },
    output: {
      response: { type: 'number', required: true },
    },
  },

  [IPC_CHANNELS.DIALOG_ERROR]: {
    input: {
      title: { type: 'string', required: true },
      content: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
    },
  },
};

/**
 * App info handlers
 */
export const appSchema = {
  [IPC_CHANNELS.APP_GET_VERSION]: {
    input: {},
    output: {
      electron: { type: 'string', required: true },
      chrome: { type: 'string', required: true },
      node: { type: 'string', required: true },
      v8: { type: 'string', required: true },
      app: { type: 'string', required: true },
    },
  },

  [IPC_CHANNELS.APP_GET_PATH]: {
    input: {
      name: { type: 'string', required: true },
    },
    output: {
      path: { type: 'string', required: true },
    },
  },

  [IPC_CHANNELS.APP_QUIT]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
    },
  },

  [IPC_CHANNELS.APP_RELAUNCH]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
    },
  },

  'app:is-packaged': {
    input: {},
    output: {
      isPackaged: { type: 'boolean', required: true },
    },
  },
};

/**
 * Secure Store (Encrypted Storage) handlers
 */
export const secureStoreSchema = {
  [IPC_CHANNELS.SECURE_STORE_SET]: {
    input: {
      key: { type: 'string', required: true },
      value: { type: 'any', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.SECURE_STORE_GET]: {
    input: {
      key: { type: 'string', required: true },
    },
    output: {
      value: { type: 'any', required: false },
    },
  },

  [IPC_CHANNELS.SECURE_STORE_DELETE]: {
    input: {
      key: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.SECURE_STORE_HAS]: {
    input: {
      key: { type: 'string', required: true },
    },
    output: {
      exists: { type: 'boolean', required: true },
    },
  },

  [IPC_CHANNELS.SECURE_STORE_IS_AVAILABLE]: {
    input: {},
    output: {
      available: { type: 'boolean', required: true },
    },
  },
};

/**
 * System handlers
 */
export const systemSchema = {
  [IPC_CHANNELS.SYSTEM_GET_PLATFORM]: {
    input: {},
    output: {
      platform: { type: 'string', required: true },
      arch: { type: 'string', required: true },
    },
  },
};

/**
 * File operation handlers
 */
export const fileSchema = {
  [IPC_CHANNELS.FILE_DROP]: {
    input: {
      filePaths: { type: 'array', required: true },
      options: { type: 'object', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
      validFiles: { type: 'array', required: false },
      invalidFiles: { type: 'array', required: false },
      total: { type: 'number', required: false },
      valid: { type: 'number', required: false },
      invalid: { type: 'number', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.FILE_DRAG_START]: {
    input: {
      filePath: { type: 'string', required: true },
      icon: { type: 'string', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
      file: { type: 'object', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.FILE_VALIDATE_PATH]: {
    input: {
      filePath: { type: 'string', required: true },
      options: { type: 'object', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
      metadata: { type: 'object', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.FILE_WATCH_START]: {
    input: {
      filePath: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      path: { type: 'string', required: false },
      metadata: { type: 'object', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.FILE_WATCH_STOP]: {
    input: {
      filePath: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      path: { type: 'string', required: false },
      error: { type: 'string', required: false },
    },
  },
};

/**
 * Data management handlers
 */
export const dataSchema = {
  [IPC_CHANNELS.DATA_CREATE_BACKUP]: {
    input: {
      type: { type: 'string', required: false },
      includeDatabase: { type: 'boolean', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
      backup: { type: 'object', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.DATA_LIST_BACKUPS]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
      backups: { type: 'array', required: true },
      total: { type: 'number', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.DATA_RESTORE_BACKUP]: {
    input: {
      filename: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      message: { type: 'string', required: false },
      error: { type: 'string', required: false },
    },
  },

  'data:validate-backup': {
    input: {
      filename: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      isValid: { type: 'boolean', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.DATA_DELETE_BACKUP]: {
    input: {
      filename: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      deleted: { type: 'string', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.DATA_IMPORT]: {
    input: {
      filePath: { type: 'string', required: true },
      options: { type: 'object', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
      data: { type: 'any', required: false },
      format: { type: 'string', required: false },
      path: { type: 'string', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.DATA_EXPORT]: {
    input: {
      filePath: { type: 'string', required: true },
      data: { type: 'any', required: false },
      preset: { type: 'string', required: false },
      options: { type: 'object', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
      path: { type: 'string', required: false },
      format: { type: 'string', required: false },
      size: { type: 'number', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.DATA_LIST_FORMATS]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
      formats: { type: 'array', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.CONNECTIVITY_STATUS]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
      online: { type: 'boolean', required: false },
      checkUrl: { type: 'string', required: false },
      lastCheck: { type: 'number', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.SYNC_QUEUE_ADD]: {
    input: {
      operation: { type: 'object', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      id: { type: 'string', required: false },
      queued: { type: 'number', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.SYNC_QUEUE_PROCESS]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
      processed: { type: 'number', required: false },
      failed: { type: 'number', required: false },
      pending: { type: 'number', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.SYNC_QUEUE_STATUS]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
      total: { type: 'number', required: false },
      pending: { type: 'number', required: false },
      syncing: { type: 'number', required: false },
      synced: { type: 'number', required: false },
      failed: { type: 'number', required: false },
      error: { type: 'string', required: false },
    },
  },
};

/**
 * Tray handlers
 */
export const traySchema = {
  [IPC_CHANNELS.TRAY_CREATE]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.TRAY_DESTROY]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.TRAY_CHECK_STATUS]: {
    input: {},
    output: {
      created: { type: 'boolean', required: true },
    },
  },

  [IPC_CHANNELS.TRAY_SHOW]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.TRAY_HIDE]: {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.TRAY_SET_ICON]: {
    input: {
      iconPath: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.TRAY_SET_TOOLTIP]: {
    input: {
      tooltip: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.TRAY_SET_MENU]: {
    input: {
      menuTemplate: { type: 'array', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  'tray:set-status': {
    input: {
      status: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },
};

/**
 * Dock handlers
 */
export const dockSchema = {
  'dock:set-badge': {
    input: {
      text: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
    },
  },

  'dock:set-menu': {
    input: {
      template: { type: 'array', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
    },
  },
};

/**
 * Notification handlers
 */
export const notificationSchema = {
  [IPC_CHANNELS.NOTIFICATION_SHOW]: {
    input: {
      title: { type: 'string', required: true },
      body: { type: 'string', required: true },
      // Optional fields
      icon: { type: 'string', required: false },
      silent: { type: 'boolean', required: false },
      urgency: { type: 'string', required: false },
      timeoutType: { type: 'string', required: false },
      timeoutMs: { type: 'number', required: false },
      actions: { type: 'array', required: false },
    },
    output: {
      success: { type: 'boolean', required: true },
      id: { type: 'string', required: false },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.NOTIFICATION_CLOSE]: {
    input: {
      id: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.NOTIFICATION_GET_HISTORY]: {
    input: {
      limit: { type: 'number', required: false },
    },
    output: {
      history: { type: 'array', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.NOTIFICATION_CHECK_PERMISSION]: {
    input: {},
    output: {
      allowed: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },

  [IPC_CHANNELS.NOTIFICATION_REQUEST_PERMISSION]: {
    input: {},
    output: {
      granted: { type: 'boolean', required: true },
      error: { type: 'string', required: false },
    },
  },
};

/**
 * i18n handlers
 */
export const i18nSchema = {
  [IPC_CHANNELS.I18N_SET_LANGUAGE]: {
    input: {
      language: { type: 'string', required: true },
    },
    output: {
      success: { type: 'boolean', required: true },
    },
  },

  [IPC_CHANNELS.I18N_GET_LANGUAGE]: {
    input: {},
    output: {
      language: { type: 'string', required: true },
    },
  },
};

/**
 * Plugin handlers
 */
export const pluginsSchema = {
  'plugins:get-all': {
    input: {},
    output: {
      success: { type: 'boolean', required: true },
      plugins: { type: 'array', required: false },
    },
  },
};

/**
 * Combined schema export
 */
export const ipcSchema = {
  ...windowSchema,
  ...storeSchema,
  ...secureStoreSchema,
  ...dialogSchema,
  ...appSchema,
  ...systemSchema,
  ...fileSchema,
  ...dataSchema,
  ...traySchema,
  ...notificationSchema,
  ...progressSchema,
  ...i18nSchema,
  ...pluginsSchema,
  ...dockSchema,
};

