/**
 * File Watcher Service
 * Monitors external file changes and notifies renderer
 */

import { watch } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { IPC_CHANNELS } from '../../common/constants.js';
import { logger } from '../logger.js';

/**
 * FileWatcher Class
 * Manages file watching with debouncing and conflict detection
 */
export class FileWatcher {
  constructor(options = {}) {
    this.watchers = new Map(); // Map of filePath -> { watcher, metadata, timeout }
    this.debounceDelay = options.debounceDelay || 300; // 300ms default (tuned for responsiveness)
    this.cleanupInterval = options.cleanupInterval || 60000; // 60s cleanup interval
    this.maxIdleTime = options.maxIdleTime || 300000; // 5min idle before cleanup
    this.cleanupTimer = null;
  }

  /**
   * Initialize file watcher with periodic cleanup
   */
  initialize() {
    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Start periodic memory cleanup
   */
  startCleanup() {
    if (this.cleanupTimer) {
      return;
    }

    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.cleanupInterval);

    logger.debug('File watcher cleanup started', {
      interval: this.cleanupInterval,
      maxIdleTime: this.maxIdleTime
    });
  }

  /**
   * Stop cleanup timer
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      logger.debug('File watcher cleanup stopped');
    }
  }

  /**
   * Perform memory cleanup
   */
  performCleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [filePath, watchData] of this.watchers.entries()) {
      // Check if watcher is idle (no changes for maxIdleTime)
      if (watchData.lastActivity && now - watchData.lastActivity > this.maxIdleTime) {
        try {
          watchData.watcher.close();
          
          if (watchData.timeout) {
            clearTimeout(watchData.timeout);
          }
          
          this.watchers.delete(filePath);
          cleaned++;
          
          logger.debug(`Cleaned up idle watcher: ${filePath}`);
        } catch (error) {
          logger.error(`Failed to cleanup watcher for ${filePath}:`, error);
        }
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} idle file watchers`, {
        remaining: this.watchers.size
      });
    }
  }

  /**
   * Start watching a file
   * @param {string} filePath - Path to file to watch
   * @param {BrowserWindow} window - Window to notify
   * @returns {Promise<object>} Result
   */
  async watch(filePath, window) {
    try {
      // Normalize path
      const normalizedPath = path.resolve(filePath);

      // Check if already watching
      if (this.watchers.has(normalizedPath)) {
        logger.debug(`Already watching file: ${normalizedPath}`);
        return {
          success: true,
          message: 'Already watching',
          path: normalizedPath
        };
      }

      // Get initial metadata
      const metadata = await this.getFileMetadata(normalizedPath);
      
      if (!metadata) {
        return {
          success: false,
          error: 'File does not exist'
        };
      }

      // Create watcher
      const watcher = watch(normalizedPath, (eventType, filename) => {
        this.handleFileChange(normalizedPath, eventType, filename, window);
      });

      // Store watcher and metadata
      this.watchers.set(normalizedPath, {
        watcher,
        metadata,
        window,
        timeout: null,
        lastActivity: Date.now() // Track activity for cleanup
      });

      logger.info(`Started watching file: ${normalizedPath}`);

      return {
        success: true,
        path: normalizedPath,
        metadata
      };
    } catch (error) {
      logger.error('Failed to watch file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Stop watching a file
   * @param {string} filePath - Path to file
   * @returns {Promise<object>} Result
   */
  async unwatch(filePath) {
    try {
      const normalizedPath = path.resolve(filePath);
      const watcherData = this.watchers.get(normalizedPath);

      if (!watcherData) {
        return {
          success: true,
          message: 'Not watching this file'
        };
      }

      // Clear any pending timeout
      if (watcherData.timeout) {
        clearTimeout(watcherData.timeout);
      }

      // Close watcher
      watcherData.watcher.close();

      // Remove from map
      this.watchers.delete(normalizedPath);

      logger.info(`Stopped watching file: ${normalizedPath}`);

      return {
        success: true,
        path: normalizedPath
      };
    } catch (error) {
      logger.error('Failed to unwatch file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle file change event with debouncing
   */
  handleFileChange(filePath, eventType, filename, window) {
    const watcherData = this.watchers.get(filePath);
    
    if (!watcherData) {
      return;
    }

    // Update last activity time for cleanup
    watcherData.lastActivity = Date.now();

    // Clear existing timeout
    if (watcherData.timeout) {
      clearTimeout(watcherData.timeout);
    }

    // Set new timeout for debouncing (300ms - tuned for responsiveness vs performance)
    watcherData.timeout = setTimeout(async () => {
      try {
        // Get current metadata
        const currentMetadata = await this.getFileMetadata(filePath);

        if (!currentMetadata) {
          // File was deleted
          this.notifyFileChange(window, {
            path: filePath,
            event: 'deleted',
            previous: watcherData.metadata
          });

          // Stop watching deleted file
          await this.unwatch(filePath);
          return;
        }

        // Check if file actually changed
        const hasChanged = this.hasFileChanged(watcherData.metadata, currentMetadata);

        if (hasChanged) {
          this.notifyFileChange(window, {
            path: filePath,
            event: 'modified',
            previous: watcherData.metadata,
            current: currentMetadata
          });

          // Update stored metadata
          watcherData.metadata = currentMetadata;
        }
      } catch (error) {
        logger.error('Error handling file change:', error);
      }
    }, this.debounceDelay);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        mtime: stats.mtime.getTime(),
        exists: true
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // File doesn't exist
      }
      throw error;
    }
  }

  /**
   * Check if file has changed
   */
  hasFileChanged(previous, current) {
    return previous.size !== current.size || 
           previous.mtime !== current.mtime;
  }

  /**
   * Notify window of file change
   */
  notifyFileChange(window, data) {
    if (window && !window.isDestroyed()) {
      window.webContents.send(IPC_CHANNELS.FILE_CHANGED, data);
      logger.info('File change notification sent:', {
        path: data.path,
        event: data.event
      });
    }
  }

  /**
   * Get list of watched files
   */
  getWatchedFiles() {
    return Array.from(this.watchers.keys());
  }

  /**
   * Stop watching all files
   */
  async unwatchAll() {
    const paths = this.getWatchedFiles();
    const results = await Promise.all(
      paths.map(path => this.unwatch(path))
    );
    
    logger.info(`Stopped watching ${results.length} files`);
    return {
      success: true,
      count: results.length
    };
  }

  /**
   * Cleanup on app quit
   */
  async cleanup() {
    this.stopCleanup();
    await this.unwatchAll();
    logger.info('File watcher cleanup complete');
  }
}

// Create singleton instance
const fileWatcher = new FileWatcher();

// Initialize cleanup
fileWatcher.initialize();

export default fileWatcher;
