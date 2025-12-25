/**
 * File Operations IPC Handlers
 * Handles drag-and-drop, file validation, and file watching
 */

import path from 'path';
import fs from 'fs/promises';
import { BrowserWindow, app, nativeImage, IpcMainInvokeEvent } from 'electron';
import { IPC_CHANNELS } from '../../../common/constants.ts';
import { logger } from '../../logger.ts';
import fileWatcher from '../../data/file-watcher.ts';
import {
  validateFilePath as secureValidatePath,
  sanitizeFilename,
  fileOperationLimiter
} from '../../security/data-security.ts';
import { IPCMetadata, IPCResponse } from '../../../common/types.ts';

// Security configuration
const ALLOWED_EXTENSIONS = [
  '.txt', '.json', '.csv', '.md', '.html', '.xml',
  '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.zip', '.tar', '.gz'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB default
const FALLBACK_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

interface FileMetadata {
  path: string;
  name: string;
  extension: string;
  size?: number;
  modified?: Date;
}

type ValidationResult =
  | { valid: false; error: string; code?: string }
  | { valid: true; metadata: FileMetadata };

interface ValidationOptions {
  allowedExtensions?: string[];
  maxSize?: number;
  mustExist?: boolean;
}
/**
 * Validate file path for security (wrapper for centralized security module)
 * Prevents path traversal, checks extensions and size limits
 * @param {string} filePath - Path to validate
 * @param {object} options - Validation options
 * @returns {Promise<ValidationResult>}
 */
export async function validateFilePath(filePath: string, options: ValidationOptions = {}): Promise<ValidationResult> {
  const {
    allowedExtensions = ALLOWED_EXTENSIONS,
    maxSize = MAX_FILE_SIZE,
    mustExist = true
  } = options;

  // Use centralized security validation
  const securityResult = secureValidatePath(filePath, {
    allowedExtensions,
    maxSize,
    allowAbsolute: true,
    allowRelative: false
  });

  if (!securityResult.valid) {
    const failure = securityResult as { valid: false; error: string };
    return {
      valid: false,
      error: failure.error || 'Invalid path',
      code: 'INVALID_PATH'
    };
  }

  const { resolvedPath } = securityResult;

  // Check if file exists (if required)
  if (mustExist) {
    try {
      const stats = await fs.stat(resolvedPath);

      // Verify it's a file, not a directory
      if (!stats.isFile()) {
        return {
          valid: false,
          error: 'Path must point to a file, not a directory',
          code: 'NOT_A_FILE'
        };
      }

      // Check file size
      if (stats.size > maxSize) {
        return {
          valid: false,
          error: `File size (${stats.size} bytes) exceeds maximum (${maxSize} bytes)`,
          code: 'FILE_TOO_LARGE'
        };
      }

      // Return success with metadata
      return {
        valid: true,
        metadata: {
          path: resolvedPath,
          name: path.basename(resolvedPath),
          extension: securityResult.extension,
          size: stats.size,
          modified: stats.mtime
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        valid: false,
        error: `File does not exist or is not accessible: ${message}`,
        code: 'FILE_NOT_ACCESSIBLE'
      };
    }
  }

  // If existence check not required, return basic validation
  return {
    valid: true,
    metadata: {
      path: resolvedPath,
      name: sanitizeFilename(path.basename(resolvedPath)),
      extension: securityResult.extension
    }
  };
}

/**
 * Handle file drop operation
 */
export async function handleFileDrop(event: IpcMainInvokeEvent, payload: { filePaths: string[]; options?: ValidationOptions }) {
  // Rate limiting
  if (!fileOperationLimiter.isAllowed('file-drop')) {
    return {
      success: false,
      error: 'Too many file operations. Please wait and try again.',
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  const { filePaths, options = {} } = payload;

  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    return {
      success: false,
      error: 'No file paths provided'
    };
  }

  logger.info(`Processing dropped files: ${filePaths.length} files`);

  const validationPromises = filePaths.map(filePath => validateFilePath(filePath, options));
  const results: ValidationResult[] = await Promise.all(validationPromises);

  // Log warnings for all invalid files after processing all
  results.forEach((r, i) => {
    if (!r.valid) {
      const failure = r as { valid: false; error: string };
      logger.warn(`File validation failed for ${filePaths[i]}: ${failure.error}`);
    }
  });

  const invalidFilesList = results
    .map((r, i) => {
      if (!r.valid) {
        const failure = r as { valid: false; error: string };
        return { path: filePaths[i], error: failure.error };
      }
      return null;
    })
    .filter((item): item is { path: string; error: string } => item !== null);

  const validFiles = results
    .filter((r): r is { valid: true; metadata: FileMetadata } => r.valid)
    .map(r => r.metadata); // map after narrowing

  return {
    success: true,
    validFiles: validFiles,
    invalidFiles: invalidFilesList,
    total: filePaths.length,
    valid: validFiles.length,
    invalid: invalidFilesList.length
  };
}

/**
 * Handle drag start operation (drag from app to desktop)
 */
export async function handleDragStart(event: IpcMainInvokeEvent, payload: { filePath: string; icon?: string }) {
  const { filePath, icon } = payload;

  if (!filePath) {
    return {
      success: false,
      error: 'No file path provided'
    };
  }

  try {
    // Validate file exists and is accessible
    const validation = await validateFilePath(filePath, { mustExist: true });

    if (!validation.valid) {
      const failure = validation as { valid: false; error: string };
      return {
        success: false,
        error: failure.error
      };
    }

    // Get the window that initiated the drag
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      return {
        success: false,
        error: 'Could not find source window'
      };
    }

    // Start native drag operation
    const dragOptions: { file: string; icon: Electron.NativeImage } = {
      file: validation.metadata.path,
      icon: nativeImage.createEmpty() // Placeholder, will be set below
    };

    if (icon) {
      dragOptions.icon = nativeImage.createFromPath(icon);
    } else {
      // Use default app icon if available, or fallback to generated image
      const defaultIconPath = path.join(app.getAppPath(), 'assets', 'icon-Template.png');
      let img = nativeImage.createFromPath(defaultIconPath);

      if (img.isEmpty()) {
        logger.warn('Default icon is empty or missing, using fallback');
        img = nativeImage.createFromDataURL(FALLBACK_ICON);
      }
      dragOptions.icon = img;
    }

    event.sender.startDrag(dragOptions);

    logger.info(`Started drag operation for file: ${validation.metadata.name}`);

    return {
      success: true,
      file: validation.metadata
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Drag start error:', error);
    return {
      success: false,
      error: message
    };
  }
}

/**
 * Handle file path validation request (IPC handler)
 */
export async function handleValidateFilePath(event: IpcMainInvokeEvent, payload: { filePath: string; options?: ValidationOptions }) {
  const { filePath, options = {} } = payload;

  if (!filePath) {
    return {
      success: false,
      error: 'No file path provided'
    };
  }

  const validation = await validateFilePath(filePath, options);

  if (validation.valid) {
    return {
      success: true,
      error: undefined,
      metadata: validation.metadata
    };
  } else {
    const failure = validation as { valid: false; error: string };
    return {
      success: false,
      error: failure.error,
      metadata: undefined
    };
  }
}

/**
 * Handle file watch start request
 */
export async function handleFileWatchStart(event: IpcMainInvokeEvent, payload: { filePath: string }) {
  const { filePath } = payload;

  if (!filePath) {
    return {
      success: false,
      error: 'No file path provided'
    };
  }

  try {
    // Get the window that made the request
    const window = BrowserWindow.fromWebContents(event.sender);

    if (!window) {
      return {
        success: false,
        error: 'Could not find source window'
      };
    }

    const result = await fileWatcher.watch(filePath, window);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('File watch start error:', error);
    return {
      success: false,
      error: message
    };
  }
}

/**
 * Handle file watch stop request
 */
export async function handleFileWatchStop(event: IpcMainInvokeEvent, payload: { filePath: string }) {
  const { filePath } = payload;

  if (!filePath) {
    return {
      success: false,
      error: 'No file path provided'
    };
  }

  try {
    const result = await fileWatcher.unwatch(filePath);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('File watch stop error:', error);
    return {
      success: false,
      error: message
    };
  }
}

// Export handlers registry
export const fileHandlers = {
  [IPC_CHANNELS.FILE_DROP]: handleFileDrop,
  [IPC_CHANNELS.FILE_DRAG_START]: handleDragStart,
  [IPC_CHANNELS.FILE_VALIDATE_PATH]: handleValidateFilePath,
  [IPC_CHANNELS.FILE_WATCH_START]: handleFileWatchStart,
  [IPC_CHANNELS.FILE_WATCH_STOP]: handleFileWatchStop
};

export default fileHandlers;
