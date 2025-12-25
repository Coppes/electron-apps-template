import { BrowserWindow } from 'electron';
import { logger } from '../../logger.ts';
import { createErrorResponse, createSuccessResponse } from '../bridge.ts';
import { IPC_CHANNELS } from '../../../common/constants.ts';
import { setProgress, clearProgress } from '../../progress.ts';

import { WindowManager } from '../../window-manager.ts';

/**
 * Window management IPC handlers
 */

/**
 * Create window handler
 * @param {WindowManager} windowManager - Window manager instance
 */
export function createWindowHandler(windowManager: WindowManager) {
  return async (event: Electron.IpcMainInvokeEvent, { type, options = {} }: { type: string; options?: any }) => {
    try {
      const window = windowManager.createWindow(type, options);
      return createSuccessResponse({
        windowId: window.id,
      });
    } catch (error: any) {
      logger.error('Failed to create window', error);
      return createErrorResponse(error.message, 'WINDOW_CREATE_FAILED');
    }
  };
}

/**
 * Close window handler
 * @param {WindowManager} windowManager - Window manager instance
 */
export function closeWindowHandler(windowManager: WindowManager) {
  return async (event: Electron.IpcMainInvokeEvent, { windowId }: { windowId?: number } = {}) => {
    try {
      let id = windowId;
      if (!id) {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) id = window.id;
      }

      if (!id) {
        return createErrorResponse('Window not found', 'WINDOW_NOT_FOUND');
      }

      const success = windowManager.closeWindow(id);
      return createSuccessResponse({ closed: success });
    } catch (error: any) {
      logger.error('Failed to close window', error);
      return createErrorResponse(error.message, 'WINDOW_CLOSE_FAILED');
    }
  };
}

/**
 * Minimize window handler
 */
export function minimizeWindowHandler() {
  return async (event: Electron.IpcMainInvokeEvent, { windowId }: { windowId?: number } = {}) => {
    try {
      const window = windowId
        ? BrowserWindow.fromId(windowId)
        : BrowserWindow.fromWebContents(event.sender);

      if (window && !window.isDestroyed()) {
        window.minimize();
        return createSuccessResponse();
      }

      return createErrorResponse('Window not found', 'WINDOW_NOT_FOUND');
    } catch (error: any) {
      logger.error('Failed to minimize window', error);
      return createErrorResponse(error.message, 'WINDOW_MINIMIZE_FAILED');
    }
  };
}

/**
 * Maximize/unmaximize window handler
 */
export function maximizeWindowHandler() {
  return async (event: Electron.IpcMainInvokeEvent, { windowId }: { windowId?: number } = {}) => {
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
    } catch (error: any) {
      logger.error('Failed to maximize window', error);
      return createErrorResponse(error.message, 'WINDOW_MAXIMIZE_FAILED');
    }
  };
}

/**
 * Get window state handler
 * @param {WindowManager} windowManager - Window manager instance
 */
export function getWindowStateHandler(windowManager: WindowManager) {
  return async (event: Electron.IpcMainInvokeEvent, { windowId }: { windowId?: number } = {}) => {
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
 * Get display info handler
 */
export function getDisplayHandler() {
  return async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        // Dynamic import or use top-level if possible. electron export screen.
        // screen is available in main process.
        const { screen } = await import('electron');
        const display = screen.getDisplayMatching(window.getBounds());
        return createSuccessResponse({ display });
      }
      return createErrorResponse('Window not found', 'WINDOW_NOT_FOUND');
    } catch (error) {
      logger.error('Failed to get display info', error);
      return createErrorResponse(error.message, 'GET_DISPLAY_FAILED');
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
    'window:get-display': getDisplayHandler(),
    [IPC_CHANNELS.PROGRESS_SET]: progressSetHandler(),
    [IPC_CHANNELS.PROGRESS_CLEAR]: progressClearHandler(),
  };
}

/**
 * Set progress handler
 */
function progressSetHandler() {
  return async (event: Electron.IpcMainInvokeEvent, { value, windowId, state }: any) => {
    try {
      // Cast to any to satisfy explicit typing in progress.set
      const success = setProgress(value, { windowId, state } as any);
      return createSuccessResponse({ success });
    } catch (error: any) {
      logger.error('Failed to set progress', error);
      return createErrorResponse(error.message, 'PROGRESS_SET_FAILED');
    }
  };
}

/**
 * Clear progress handler
 */
function progressClearHandler() {
  return async (event: Electron.IpcMainInvokeEvent, { windowId }: { windowId?: number } = {}) => {
    try {
      const success = clearProgress(windowId);
      return createSuccessResponse({ success });
    } catch (error: any) {
      logger.error('Failed to clear progress', error);
      return createErrorResponse(error.message, 'PROGRESS_CLEAR_FAILED');
    }
  };
}
