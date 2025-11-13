/**
 * Import/Export Manager
 * Handles data portability in multiple formats
 */

import path from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { logger } from '../logger.js';
import jsonHandler from './format-handlers/json-handler.js';
import csvHandler from './format-handlers/csv-handler.js';
import markdownHandler from './format-handlers/markdown-handler.js';

// File size thresholds
const STREAMING_THRESHOLD = 10 * 1024 * 1024; // 10MB - use streaming for files larger than this

/**
 * ImportExportManager Class
 * Manages format handlers and data transformation
 */
export class ImportExportManager {
  constructor() {
    this.handlers = new Map();
    this.maxFileSize = 100 * 1024 * 1024; // 100MB default
  }

  /**
   * Register a format handler
   * @param {string} format - Format name (json, csv, md)
   * @param {object} handler - Handler object with export/import methods
   */
  registerHandler(format, handler) {
    this.handlers.set(format.toLowerCase(), handler);
    logger.debug(`Registered format handler: ${format}`);
  }

  /**
   * Get handler for format
   */
  getHandler(format) {
    return this.handlers.get(format.toLowerCase());
  }

  /**
   * Auto-detect format from file extension
   */
  detectFormat(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const formatMap = {
      '.json': 'json',
      '.csv': 'csv',
      '.md': 'markdown',
      '.markdown': 'markdown'
    };
    return formatMap[ext] || null;
  }

  /**
   * Export data to file
   * @param {string} filePath - Destination file path
   * @param {any} data - Data to export
   * @param {object} options - Export options
   * @returns {Promise<object>} Result
   */
  async export(filePath, data, options = {}) {
    try {
      const { format: specifiedFormat, ...handlerOptions } = options;
      
      // Determine format
      const format = specifiedFormat || this.detectFormat(filePath);
      
      if (!format) {
        return {
          success: false,
          error: 'Could not determine format. Specify format option or use known extension.'
        };
      }

      // Get handler
      const handler = this.getHandler(format);
      
      if (!handler) {
        return {
          success: false,
          error: `No handler registered for format: ${format}`
        };
      }

      // Validate data
      if (handler.validate) {
        const validation = handler.validate(data);
        if (!validation.valid) {
          return {
            success: false,
            error: `Data validation failed: ${validation.error}`
          };
        }
      }

      // Export data
      const exported = await handler.export(data, handlerOptions);

      // Use streaming for large exports
      if (exported.length > STREAMING_THRESHOLD && handler.exportStream) {
        await new Promise((resolve, reject) => {
          const writeStream = createWriteStream(filePath);
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
          
          handler.exportStream(data, handlerOptions, writeStream);
        });
      } else {
        // Write to file directly for small files
        await fs.writeFile(filePath, exported, 'utf8');
      }

      logger.info(`Data exported to ${filePath} (${format})`);

      return {
        success: true,
        path: filePath,
        format,
        size: exported.length
      };
    } catch (error) {
      logger.error('Export failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Import data from file
   * @param {string} filePath - Source file path
   * @param {object} options - Import options
   * @returns {Promise<object>} Result with data
   */
  async import(filePath, options = {}) {
    try {
      // Check file exists
      const stats = await fs.stat(filePath);

      // Check file size
      if (stats.size > this.maxFileSize) {
        return {
          success: false,
          error: `File too large (${stats.size} bytes). Maximum: ${this.maxFileSize} bytes`
        };
      }

      // Determine format
      const { format: specifiedFormat, ...handlerOptions } = options;
      const format = specifiedFormat || this.detectFormat(filePath);

      if (!format) {
        return {
          success: false,
          error: 'Could not determine format. Specify format option.'
        };
      }

      // Get handler
      const handler = this.getHandler(format);

      if (!handler) {
        return {
          success: false,
          error: `No handler registered for format: ${format}`
        };
      }

      // Use streaming for large files
      let data;
      if (stats.size > STREAMING_THRESHOLD && handler.importStream) {
        data = await new Promise((resolve, reject) => {
          const readStream = createReadStream(filePath, 'utf8');
          handler.importStream(readStream, handlerOptions)
            .then(resolve)
            .catch(reject);
        });
      } else {
        // Read file directly for small files
        const content = await fs.readFile(filePath, 'utf8');
        data = await handler.import(content, handlerOptions);
      }

      logger.info(`Data imported from ${filePath} (${format})`);

      return {
        success: true,
        data,
        format,
        path: filePath
      };
    } catch (error) {
      logger.error('Import failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List available formats
   */
  listFormats() {
    return Array.from(this.handlers.keys());
  }
}

// Create singleton instance
const importExportManager = new ImportExportManager();

// Register built-in handlers
importExportManager.registerHandler('json', jsonHandler);
importExportManager.registerHandler('csv', csvHandler);
importExportManager.registerHandler('markdown', markdownHandler);

export default importExportManager;
