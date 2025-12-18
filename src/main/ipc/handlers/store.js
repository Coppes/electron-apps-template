import Store from 'electron-store';
import { BrowserWindow } from 'electron';
import { logger } from '../../logger.js';
import { createErrorResponse, createSuccessResponse } from '../bridge.js';
import { IPC_CHANNELS } from '../../../common/constants.js';

const defaults = {
  appearance: { theme: 'system', density: 'normal' },
  history: { maxStackSize: 50 },
  language: 'en',
  hasCompletedTour: false
};

const migrations = {
  '1.0.0': (store) => {
    // Migrate flat settings to nested structure if needed
    if (store.has('theme') && !store.has('appearance.theme')) {
      store.set('appearance.theme', store.get('theme'));
      store.delete('theme');
    }
    if (store.has('language') && !store.has('language')) {
      // already top level, but explicit check
    }
  }
};

export const store = new Store({
  defaults,
  migrations,
  projectVersion: '1.0.0' // Matches package.json usually
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
