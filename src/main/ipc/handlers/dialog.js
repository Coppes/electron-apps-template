import { dialog, BrowserWindow } from 'electron';
import fs from 'fs/promises';
import { logger } from '../../logger.js';
import { createErrorResponse, createSuccessResponse } from '../bridge.js';
import { IPC_CHANNELS } from '../../../common/constants.js';
import { addRecentDocument } from '../../recent-docs.js';

/**
 * Dialog IPC handlers
 */

/**
 * Open file dialog and read content
 */
export function openFileDialogHandler() {
  return async (event, { options = {} } = {}) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);

      const defaultOptions = {
        properties: ['openFile'],
        filters: [
          { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      };

      const result = await dialog.showOpenDialog(window, {
        ...defaultOptions,
        ...options,
      });

      if (result.canceled) {
        return { canceled: true };
      }

      try {
        const filePath = result.filePaths[0];
        const content = await fs.readFile(filePath, 'utf-8');

        // Add to recent documents
        addRecentDocument(filePath);

        return {
          canceled: false,
          filePath,
          content,
        };
      } catch (readError) {
        return {
          canceled: false,
          error: readError.message,
        };
      }
    } catch (error) {
      logger.error('Failed to open file dialog', error);
      return createErrorResponse(error.message, 'DIALOG_OPEN_FAILED');
    }
  };
}

/**
 * Save file dialog and write content
 */
export function saveFileDialogHandler() {
  return async (event, { options = {}, content }) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);

      const defaultOptions = {
        filters: [
          { name: 'Text Files', extensions: ['txt', 'md'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      };

      const result = await dialog.showSaveDialog(window, {
        ...defaultOptions,
        ...options,
      });

      if (result.canceled) {
        return { canceled: true };
      }

      try {
        await fs.writeFile(result.filePath, content, 'utf-8');

        // Add to recent documents
        addRecentDocument(result.filePath);

        return {
          canceled: false,
          filePath: result.filePath,
        };
      } catch (writeError) {
        return {
          canceled: false,
          error: writeError.message,
        };
      }
    } catch (error) {
      logger.error('Failed to save file dialog', error);
      return createErrorResponse(error.message, 'DIALOG_SAVE_FAILED');
    }
  };
}

/**
 * Show message dialog
 */
export function messageDialogHandler() {
  return async (event, { options }) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      const result = await dialog.showMessageBox(window, options);
      return { response: result.response };
    } catch (error) {
      logger.error('Failed to show message dialog', error);
      return createErrorResponse(error.message, 'DIALOG_MESSAGE_FAILED');
    }
  };
}

/**
 * Show error dialog
 */
export function errorDialogHandler() {
  return async (event, { title, content }) => {
    try {
      dialog.showErrorBox(title, content);
      return createSuccessResponse();
    } catch (error) {
      logger.error('Failed to show error dialog', error);
      return createErrorResponse(error.message, 'DIALOG_ERROR_FAILED');
    }
  };
}

/**
 * Create all dialog handlers
 * @returns {Object} Handlers keyed by channel
 */
export function createDialogHandlers() {
  return {
    [IPC_CHANNELS.DIALOG_OPEN_FILE]: openFileDialogHandler(),
    [IPC_CHANNELS.DIALOG_SAVE_FILE]: saveFileDialogHandler(),
    [IPC_CHANNELS.DIALOG_MESSAGE]: messageDialogHandler(),
    [IPC_CHANNELS.DIALOG_ERROR]: errorDialogHandler(),
  };
}
