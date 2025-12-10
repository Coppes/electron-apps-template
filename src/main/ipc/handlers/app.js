import { app } from 'electron';
import { logger } from '../../logger.js';
import { updater } from '../../updater.js';
import { createErrorResponse, createSuccessResponse } from '../bridge.js';
import { IPC_CHANNELS } from '../../../common/constants.js';
import { addRecentDocument, clearRecentDocuments } from '../../recent-docs.js';

/**
 * App and system info IPC handlers
 */

/**
 * Get app and runtime versions
 */
export function getVersionHandler() {
  return async () => {
    try {
      return {
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node,
        v8: process.versions.v8,
        app: app.getVersion(),
      };
    } catch (error) {
      logger.error('Failed to get version info', error);
      return createErrorResponse(error.message, 'VERSION_INFO_FAILED');
    }
  };
}

/**
 * Get app path
 */
export function getPathHandler() {
  return async (event, { name }) => {
    try {
      const path = app.getPath(name);
      return { path };
    } catch (error) {
      logger.error('Failed to get app path', error);
      return createErrorResponse(error.message, 'PATH_GET_FAILED');
    }
  };
}

/**
 * Quit application
 */
export function quitHandler() {
  return async () => {
    try {
      app.quit();
      return createSuccessResponse();
    } catch (error) {
      logger.error('Failed to quit app', error);
      return createErrorResponse(error.message, 'QUIT_FAILED');
    }
  };
}

/**
 * Relaunch application
 */
export function relaunchHandler() {
  return async () => {
    try {
      app.relaunch();
      app.quit();
      return createSuccessResponse();
    } catch (error) {
      logger.error('Failed to relaunch app', error);
      return createErrorResponse(error.message, 'RELAUNCH_FAILED');
    }
  };
}

/**
 * Get system platform info
 */
export function getPlatformHandler() {
  return async () => {
    try {
      return {
        platform: process.platform,
        arch: process.arch,
      };
    } catch (error) {
      logger.error('Failed to get platform info', error);
      return createErrorResponse(error.message, 'PLATFORM_INFO_FAILED');
    }
  };
}

/**
 * Check for updates
 */
export function checkForUpdatesHandler() {
  return async () => {
    try {
      const result = await updater.checkForUpdates();
      if (result && result.updateInfo) {
        return {
          available: true,
          version: result.updateInfo.version,
        };
      }
      return { available: false };
    } catch (error) {
      logger.error('Failed to check for updates', error);
      return createErrorResponse(error.message, 'UPDATE_CHECK_FAILED');
    }
  };
}

/**
 * Install update and restart
 */
export function installUpdateHandler() {
  return async () => {
    try {
      updater.quitAndInstall();
      return createSuccessResponse();
    } catch (error) {
      logger.error('Failed to install update', error);
      return createErrorResponse(error.message, 'UPDATE_INSTALL_FAILED');
    }
  };
}



/**
 * Check if app is packaged
 */
export function isPackagedHandler() {
  return async () => {
    try {
      return { isPackaged: app.isPackaged };
    } catch (error) {
      logger.error('Failed to check if app is packaged', error);
      return createErrorResponse(error.message, 'IS_PACKAGED_FAILED');
    }
  };
}

/**
 * Create all app and system handlers
 * @returns {Object} Handlers keyed by channel
 */
export function createAppHandlers() {
  return {
    [IPC_CHANNELS.APP_GET_VERSION]: getVersionHandler(),
    [IPC_CHANNELS.APP_GET_PATH]: getPathHandler(),
    [IPC_CHANNELS.APP_QUIT]: quitHandler(),
    [IPC_CHANNELS.APP_RELAUNCH]: relaunchHandler(),
    [IPC_CHANNELS.SYSTEM_GET_PLATFORM]: getPlatformHandler(),
    [IPC_CHANNELS.APP_CHECK_FOR_UPDATES]: checkForUpdatesHandler(),
    [IPC_CHANNELS.APP_INSTALL_UPDATE]: installUpdateHandler(),
    [IPC_CHANNELS.RECENT_DOCS_ADD]: addRecentDocHandler(),
    [IPC_CHANNELS.RECENT_DOCS_CLEAR]: clearRecentDocsHandler(),
    'app:is-packaged': isPackagedHandler(),
  };
}

/**
 * Add recent document handler
 */
function addRecentDocHandler() {
  return async (event, { filePath }) => {
    try {
      if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid file path');
      }

      const success = addRecentDocument(filePath);
      return createSuccessResponse({ success });
    } catch (error) {
      logger.error('Failed to add recent document', error);
      return createErrorResponse(error.message, 'RECENT_DOC_ADD_FAILED');
    }
  };
}

/**
 * Clear recent documents handler
 */
function clearRecentDocsHandler() {
  return async () => {
    try {
      const success = clearRecentDocuments();
      return createSuccessResponse({ success });
    } catch (error) {
      logger.error('Failed to clear recent documents', error);
      return createErrorResponse(error.message, 'RECENT_DOCS_CLEAR_FAILED');
    }
  };
}
