import { dialog, BrowserWindow, OpenDialogOptions, SaveDialogOptions, MessageBoxOptions, IpcMainInvokeEvent } from 'electron';
import fs from 'fs/promises';
import { logger } from '../../logger.ts';
import { createErrorResponse, createSuccessResponse } from '../bridge.ts';
import { IPC_CHANNELS } from '../../../common/constants.ts';
import { addRecentDocument } from '../../recent-docs.ts';

/**
 * Dialog IPC handlers
 */

/**
 * Open file dialog and read content
 */
export function openFileDialogHandler() {
  return async (event: IpcMainInvokeEvent, { options = {} }: { options?: OpenDialogOptions } = {}) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) throw new Error('Could not determine source window');

      const defaultOptions: OpenDialogOptions = {
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
        const message = readError instanceof Error ? readError.message : String(readError);
        return {
          canceled: false,
          error: message,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Failed to open file dialog', error);
      return createErrorResponse(message, 'DIALOG_OPEN_FAILED');
    }
  };
}

/**
 * Save file dialog and write content
 */
export function saveFileDialogHandler() {
  return async (event: IpcMainInvokeEvent, { options = {}, content }: { options?: SaveDialogOptions; content: string }) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) throw new Error('Could not determine source window');

      const defaultOptions: SaveDialogOptions = {
        filters: [
          { name: 'Text Files', extensions: ['txt', 'md'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      };

      const result = await dialog.showSaveDialog(window, {
        ...defaultOptions,
        ...options,
      });

      if (result.canceled || !result.filePath) {
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
        const message = writeError instanceof Error ? writeError.message : String(writeError);
        return {
          canceled: false,
          error: message,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Failed to save file dialog', error);
      return createErrorResponse(message, 'DIALOG_SAVE_FAILED');
    }
  };
}

/**
 * Show message dialog
 */
export function messageDialogHandler() {
  return async (event: IpcMainInvokeEvent, { options }: { options: MessageBoxOptions }) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) throw new Error('Could not determine source window');

      const result = await dialog.showMessageBox(window, options);
      return { response: result.response };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Failed to show message dialog', error);
      return createErrorResponse(message, 'DIALOG_MESSAGE_FAILED');
    }
  };
}

/**
 * Show error dialog
 */
export function errorDialogHandler() {
  return async (event: IpcMainInvokeEvent, { title, content }: { title: string; content: string }) => {
    try {
      dialog.showErrorBox(title, content);
      return createSuccessResponse();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Failed to show error dialog', error);
      return createErrorResponse(message, 'DIALOG_ERROR_FAILED');
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
