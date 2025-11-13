/**
 * File Operations IPC Handlers
 * Handles drag-and-drop, file validation, and file watching
 */

import path from 'path';
import fs from 'fs/promises';
import { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../../common/constants.js';
import { logger } from '../../logger.js';

// Security configuration
const ALLOWED_EXTENSIONS = [
  '.txt', '.json', '.csv', '.md', '.html', '.xml',
  '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.zip', '.tar', '.gz'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB default
const FORBIDDEN_PATHS = ['/etc', '/sys', '/proc', 'C:\\Windows\\System32'];

/**
 * Validate file path for security
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

  try {
    // Normalize and resolve path to prevent traversal
    const normalizedPath = path.normalize(filePath);
    const resolvedPath = path.resolve(normalizedPath);

    // Check for path traversal attempts
    if (normalizedPath.includes('..')) {
      return {
        valid: false,
        error: 'Path traversal detected'
      };
    }

    // Check against forbidden system paths
    const isForbidden = FORBIDDEN_PATHS.some(forbiddenPath => 
      resolvedPath.startsWith(forbiddenPath)
    );
    if (isForbidden) {
      return {
        valid: false,
        error: 'Access to system paths is forbidden'
      };
    }

    // Check file extension
    const ext = path.extname(resolvedPath).toLowerCase();
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `File extension ${ext} is not allowed`
      };
    }

    // Check if file exists (if required)
    if (mustExist) {
      try {
        const stats = await fs.stat(resolvedPath);

        // Verify it's a file, not a directory
        if (!stats.isFile()) {
          return {
            valid: false,
            error: 'Path must point to a file, not a directory'
          };
        }

        // Check file size
        if (stats.size > maxSize) {
          return {
            valid: false,
            error: `File size (${stats.size} bytes) exceeds maximum (${maxSize} bytes)`
          };
        }

        // Return success with metadata
        return {
          valid: true,
          metadata: {
            path: resolvedPath,
            name: path.basename(resolvedPath),
            extension: ext,
            size: stats.size,
            modified: stats.mtime
          }
        };
      } catch (error) {
        return {
          valid: false,
          error: `File does not exist or is not accessible: ${error.message}`
        };
      }
    }

    // If existence check not required, return basic validation
    return {
      valid: true,
      metadata: {
        path: resolvedPath,
        name: path.basename(resolvedPath),
        extension: ext
      }
    };
  } catch (error) {
    logger.error('File validation error:', error);
    return {
      valid: false,
      error: `Validation failed: ${error.message}`
    };
  }
}

/**
 * Handle file drop operation
 */
export async function handleFileDrop(event, payload) {
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

// Export handlers registry
export const fileHandlers = {
  [IPC_CHANNELS.FILE_DROP]: handleFileDrop,
  [IPC_CHANNELS.FILE_DRAG_START]: handleDragStart,
  [IPC_CHANNELS.FILE_VALIDATE_PATH]: handleValidateFilePath
};

export default fileHandlers;
