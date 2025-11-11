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
      windowId: { type: 'number', required: true },
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
 * Combined schema export
 */
export const ipcSchema = {
  ...windowSchema,
  ...storeSchema,
  ...dialogSchema,
  ...appSchema,
  ...systemSchema,
};
