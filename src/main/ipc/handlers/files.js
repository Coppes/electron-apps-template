/**
 * File Operations IPC Handlers
 * Handles drag-and-drop, file validation, and file watching
 */

import path from 'path';
import fs from 'fs/promises';
import { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../../common/constants.js';
import { logger } from '../../logger.js';
import fileWatcher from '../../data/file-watcher.js';
import { 
  validateFilePath as secureValidatePath, 
  sanitizeFilename,
  fileOperationLimiter 
} from '../../security/data-security.js';

// Security configuration
const ALLOWED_EXTENSIONS = [
  '.txt', '.json', '.csv', '.md', '.html', '.xml',
  '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.zip', '.tar', '.gz'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB default

/**
 * Validate file path for security (wrapper for centralized security module)
 * Prevents path traversal, checks extensions and size limits
 * @param {string} filePath - Path to validate
 * @param {object} options - Validation options
 * @returns {Promise<{valid: boolean, error?: string, metadata?: object}>}
 */
export async function validateFilePath(filePath, options = {}) {
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
    return securityResult;
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
      return {
        valid: false,
        error: `File does not exist or is not accessible: ${error.message}`,
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
export async function handleFileDrop(event, payload) {
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

  const results = [];
  for (const filePath of filePaths) {
    const validation = await validateFilePath(filePath, options);
    results.push(validation);

    if (!validation.valid) {
      logger.warn(`File validation failed for ${filePath}: ${validation.error}`);
    }
  }

  const validFiles = results.filter(r => r.valid);
  const invalidFiles = results.filter(r => !r.valid);

  return {
    success: true,
    validFiles: validFiles.map(f => f.metadata),
    invalidFiles: invalidFiles.map((f, i) => ({
      path: filePaths[i],
      error: f.error
    })),
    total: filePaths.length,
    valid: validFiles.length,
    invalid: invalidFiles.length
  };
}

/**
 * Handle drag start operation (drag from app to desktop)
 */
export async function handleDragStart(event, payload) {
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
      return {
        success: false,
        error: validation.error
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
    event.sender.startDrag({
      file: validation.metadata.path,
      icon: icon || '' // Optional drag icon
    });

    logger.info(`Started drag operation for file: ${validation.metadata.name}`);

    return {
      success: true,
      file: validation.metadata
    };
  } catch (error) {
    logger.error('Drag start error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle file path validation request (IPC handler)
 */
export async function handleValidateFilePath(event, payload) {
  const { filePath, options = {} } = payload;

  if (!filePath) {
    return {
      success: false,
      error: 'No file path provided'
    };
  }

  const validation = await validateFilePath(filePath, options);

  return {
    success: validation.valid,
    error: validation.error,
    metadata: validation.metadata
  };
}

/**
 * Handle file watch start request
 */
export async function handleFileWatchStart(event, payload) {
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
    logger.error('File watch start error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle file watch stop request
 */
export async function handleFileWatchStop(event, payload) {
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
    logger.error('File watch stop error:', error);
    return {
      success: false,
      error: error.message
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
