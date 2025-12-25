import { app } from 'electron';
import { existsSync } from 'fs';
import { isAbsolute } from 'path';
import { logger } from './logger.ts';

/**
 * Recent Documents Management
 * Integrates with OS recent documents (macOS Dock, Windows Jump List)
 */

// Whitelist of allowed file extensions (for security)
const ALLOWED_EXTENSIONS = [
  '.txt', '.md', '.json', '.xml', '.csv',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.html', '.css', '.ts', '.ts', '.jsx', '.tsx',
  '.py', '.java', '.c', '.cpp', '.h', '.hpp',
];

/**
 * Add a document to recent documents
 * @param {string} filePath - Absolute path to the document
 * @returns {boolean} Success status
 */
export function addRecentDocument(filePath) {
  try {
    // Validate path
    if (!filePath || typeof filePath !== 'string') {
      logger.warn('Invalid file path', { filePath });
      return false;
    }

    // Must be absolute path
    if (!isAbsolute(filePath)) {
      logger.warn('File path must be absolute', { filePath });
      return false;
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      logger.warn('File does not exist', { filePath });
      return false;
    }

    // Validate file extension
    if (!isAllowedExtension(filePath)) {
      logger.warn('File extension not allowed', { filePath });
      return false;
    }

    // Security: prevent directory traversal
    if (filePath.includes('..')) {
      logger.warn('Path contains directory traversal', { filePath });
      return false;
    }

    // Add to recent documents
    app.addRecentDocument(filePath);
    logger.info('Added to recent documents', { filePath });
    return true;
  } catch (error) {
    logger.error('Failed to add recent document', { filePath, error });
    return false;
  }
}

/**
 * Clear all recent documents
 * @returns {boolean} Success status
 */
export function clearRecentDocuments() {
  try {
    app.clearRecentDocuments();
    logger.info('Recent documents cleared');
    return true;
  } catch (error) {
    logger.error('Failed to clear recent documents', error);
    return false;
  }
}

/**
 * Check if file extension is allowed
 * @param {string} filePath - File path to check
 * @returns {boolean}
 */
function isAllowedExtension(filePath) {
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Add extension to whitelist
 * @param {string} extension - Extension to allow (e.g., '.myext')
 */
export function addAllowedExtension(extension) {
  if (!extension.startsWith('.')) {
    extension = '.' + extension;
  }
  if (!ALLOWED_EXTENSIONS.includes(extension.toLowerCase())) {
    ALLOWED_EXTENSIONS.push(extension.toLowerCase());
    logger.debug('Extension added to whitelist', { extension });
  }
}

/**
 * Get list of allowed extensions
 * @returns {string[]}
 */
export function getAllowedExtensions() {
  return [...ALLOWED_EXTENSIONS];
}
