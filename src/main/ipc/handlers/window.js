import { BrowserWindow } from 'electron';
import { logger } from '../../logger.js';
import { createErrorResponse, createSuccessResponse } from '../bridge.js';
import { IPC_CHANNELS } from '../../../common/constants.js';
import { setProgress, clearProgress } from '../../progress.js';

/**
 * Window management IPC handlers
 */

/**
 * Create window handler
 * @param {WindowManager} windowManager - Window manager instance
 */
export function createWindowHandler(windowManager) {
  return async (event, { type, options = {} }) => {
    try {
      const window = windowManager.createWindow(type, options);
      return createSuccessResponse({
        windowId: window.id,
      });
    } catch (error) {
      logger.error('Failed to create window', error);
      return createErrorResponse(error.message, 'WINDOW_CREATE_FAILED');
    }
  };
}

/**
 * Close window handler
 * @param {WindowManager} windowManager - Window manager instance
 */
export function closeWindowHandler(windowManager) {
  return async (event, { windowId }) => {
    try {
      const success = windowManager.closeWindow(windowId);
      return createSuccessResponse({ closed: success });
    } catch (error) {
      logger.error('Failed to close window', error);
      return createErrorResponse(error.message, 'WINDOW_CLOSE_FAILED');
    }
  };
}

/**
 * Minimize window handler
 */
export function minimizeWindowHandler() {
  return async (event, { windowId } = {}) => {
    try {
      const window = windowId
        ? BrowserWindow.fromId(windowId)
        : BrowserWindow.fromWebContents(event.sender);

      if (window && !window.isDestroyed()) {
        window.minimize();
        return createSuccessResponse();
      }

      return createErrorResponse('Window not found', 'WINDOW_NOT_FOUND');
    } catch (error) {
      logger.error('Failed to minimize window', error);
      return createErrorResponse(error.message, 'WINDOW_MINIMIZE_FAILED');
    }
  };
}

/**
 * Maximize/unmaximize window handler
 */
export function maximizeWindowHandler() {
  return async (event, { windowId } = {}) => {
    try {
      const window = windowId
        ? BrowserWindow.fromId(windowId)
        : BrowserWindow.fromWebContents(event.sender);

      if (window && !window.isDestroyed()) {
        if (window.isMaximized()) {
          window.unmaximize();
        } else {
          window.maximize();
        }
        return createSuccessResponse({ maximized: window.isMaximized() });
      }

      return createErrorResponse('Window not found', 'WINDOW_NOT_FOUND');
    } catch (error) {
      logger.error('Failed to maximize window', error);
      return createErrorResponse(error.message, 'WINDOW_MAXIMIZE_FAILED');
    }
  };
}

/**
 * Get window state handler
 * @param {WindowManager} windowManager - Window manager instance
 */
export function getWindowStateHandler(windowManager) {
  return async (event, { windowId } = {}) => {
    try {
      const window = windowId
        ? windowManager.getWindow(windowId)
        : BrowserWindow.fromWebContents(event.sender);

      if (window && !window.isDestroyed()) {
        const bounds = window.getBounds();
        const state = {
          ...bounds,
          isMaximized: window.isMaximized(),
          isMinimized: window.isMinimized(),
          isFullScreen: window.isFullScreen(),
          isFocused: window.isFocused(),
        };
        return createSuccessResponse({ state });
      }

      return createErrorResponse('Window not found', 'WINDOW_NOT_FOUND');
    } catch (error) {
      logger.error('Failed to get window state', error);
      return createErrorResponse(error.message, 'WINDOW_STATE_FAILED');
    }
  };
}

/**
 * Create all window handlers
 * @param {WindowManager} windowManager - Window manager instance
 * @returns {Object} Handlers keyed by channel
 */
export function createWindowHandlers(windowManager) {
  return {
    [IPC_CHANNELS.WINDOW_CREATE]: createWindowHandler(windowManager),
    [IPC_CHANNELS.WINDOW_CLOSE]: closeWindowHandler(windowManager),
    [IPC_CHANNELS.WINDOW_MINIMIZE]: minimizeWindowHandler(),
    [IPC_CHANNELS.WINDOW_MAXIMIZE]: maximizeWindowHandler(),
    [IPC_CHANNELS.WINDOW_GET_STATE]: getWindowStateHandler(windowManager),
    [IPC_CHANNELS.PROGRESS_SET]: progressSetHandler(),
    [IPC_CHANNELS.PROGRESS_CLEAR]: progressClearHandler(),
  };
}

/**
 * Set progress handler
 */
function progressSetHandler() {
  return async (event, { value, windowId, state }) => {
    try {
      const success = setProgress(value, { windowId, state });
      return createSuccessResponse({ success });
    } catch (error) {
      logger.error('Failed to set progress', error);
      return createErrorResponse(error.message, 'PROGRESS_SET_FAILED');
    }
  };
}

/**
 * Clear progress handler
 */
function progressClearHandler() {
  return async (event, { windowId } = {}) => {
    try {
      const success = clearProgress(windowId);
      return createSuccessResponse({ success });
    } catch (error) {
      logger.error('Failed to clear progress', error);
      return createErrorResponse(error.message, 'PROGRESS_CLEAR_FAILED');
    }
  };
}
