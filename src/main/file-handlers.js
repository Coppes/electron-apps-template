import { app } from 'electron';
import fs from 'fs/promises';
import { addRecentDocument } from './recent-docs.js';
import { logger } from './logger.js';

/**
 * Setup file association handlers
 * @param {import('./window-manager.js').WindowManager} windowManager 
 */
export function setupFileHandlers(windowManager) {
  // Handle macOS 'open-file' event
  app.on('open-file', async (event, path) => {
    event.preventDefault();
    logger.info('Opening file from OS', { path });

    const mainWindow = windowManager.getWindowByType('main');
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      try {
        const content = await fs.readFile(path, 'utf-8');
        mainWindow.webContents.send('app:file-opened', { filePath: path, content });
        addRecentDocument(path);
      } catch (error) {
        logger.error('Failed to read opened file', { path, error });
      }
    } else {
      // TODO: Queue file to be opened once window is ready
      logger.warn('Main window not available to handle file open', { path });
    }
  });
}

/**
 * Parse argv to find an associated file path
 * Windows/Linux usually pass the file path as the last argument
 * @param {string[]} argv 
 * @returns {string|null}
 */
export function findFileInArgv(argv) {
  // Skip first arg (executable) and flags or protocol links
  const fileArg = argv.slice(1).find(arg => 
    arg && 
    !arg.startsWith('-') && 
    !arg.startsWith('electronapp://')
  );
  return fileArg || null;
}
