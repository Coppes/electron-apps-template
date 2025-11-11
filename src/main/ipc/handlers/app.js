import { app } from 'electron';
import { logger } from '../../logger.js';
import { createErrorResponse, createSuccessResponse } from '../bridge.js';
import { IPC_CHANNELS } from '../../../common/constants.js';

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
  };
}
