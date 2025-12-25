import { ipcMain, app, BrowserWindow } from 'electron';
import Store, { Schema } from 'electron-store';
import { logger } from '../../logger.ts';
import { createSuccessResponse, createErrorResponse } from '../bridge.ts';
import { IPC_CHANNELS } from '../../../common/constants.ts';

/**
 * Store IPC handlers
 */

// Define store schema
const schema: Schema<any> = {
  theme: {
    type: 'string',
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },
  // ... other schema items
};

const defaults = {
  appearance: {
    theme: 'system',
    density: 'comfortable',
  },
  history: {
    maxStackSize: 100,
  },
  language: 'en',
  hasCompletedTour: false,
};

const migrations = {
  '1.0.0': (store: Store) => {
    store.set('projectVersion', '1.0.0');
  },
};

// Initialize store
export const store = new Store({
  defaults,
  migrations,
  name: 'config', // Explicit name defaults to config anyway
  cwd: app.getPath('userData'),
});

/**
 * Store IPC handlers
 */

/**
 * Get value from store
 */
export function getStoreHandler() {
  return async (event, { key }) => {
    try {
      const value = store.get(key);
      return { value };
    } catch (error) {
      logger.error('Failed to get from store', error);
      return createErrorResponse(error.message, 'STORE_GET_FAILED');
    }
  };
}

/**
 * Set value in store
 */
export function setStoreHandler() {
  return async (event, { key, value }) => {
    try {
      store.set(key, value);
      // Broadcast change
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) {
          win.webContents.send(IPC_CHANNELS.STORE_CHANGED, { key, value });
        }
      });
      return createSuccessResponse();
    } catch (error) {
      logger.error('Failed to set in store', error);
      return createErrorResponse(error.message, 'STORE_SET_FAILED');
    }
  };
}

/**
 * Delete value from store
 */
export function deleteStoreHandler() {
  return async (event, { key }) => {
    try {
      store.delete(key);
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) {
          win.webContents.send(IPC_CHANNELS.STORE_CHANGED, { key, deleted: true });
        }
      });
      return createSuccessResponse();
    } catch (error) {
      logger.error('Failed to delete from store', error);
      return createErrorResponse(error.message, 'STORE_DELETE_FAILED');
    }
  };
}

/**
 * Clear store
 */
export function clearStoreHandler() {
  return async () => {
    try {
      store.clear();
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) {
          win.webContents.send(IPC_CHANNELS.STORE_CHANGED, { cleared: true });
        }
      });
      return createSuccessResponse();
    } catch (error) {
      logger.error('Failed to clear store', error);
      return createErrorResponse(error.message, 'STORE_CLEAR_FAILED');
    }
  };
}

/**
 * Check if key exists in store
 */
export function hasStoreHandler() {
  return async (event, { key }) => {
    try {
      const exists = store.has(key);
      return { exists };
    } catch (error) {
      logger.error('Failed to check store', error);
      return createErrorResponse(error.message, 'STORE_HAS_FAILED');
    }
  };
}

/**
 * Create all store handlers
 * @returns {Object} Handlers keyed by channel
 */
export function createStoreHandlers() {
  return {
    [IPC_CHANNELS.STORE_GET]: getStoreHandler(),
    [IPC_CHANNELS.STORE_SET]: setStoreHandler(),
    [IPC_CHANNELS.STORE_DELETE]: deleteStoreHandler(),
    [IPC_CHANNELS.STORE_CLEAR]: clearStoreHandler(),
    [IPC_CHANNELS.STORE_HAS]: hasStoreHandler(),
  };
}
