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

        // Update the window reference if it has changed (e.g., after reload)
        const watcherData = this.watchers.get(normalizedPath);
        if (watcherData && watcherData.window !== window) {
          watcherData.window = window;
          logger.debug(`Updated window reference for watcher: ${normalizedPath}`);
        }

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

      // Create watcher with recursive option enabled
      const watcher = watch(normalizedPath, { recursive: true }, (eventType, filename) => {
        this.handleFileChange(normalizedPath, eventType, filename, window);
      });

      // Store watcher and metadata
      this.watchers.set(normalizedPath, {
        watcher,
        metadata,
        window,
        timeout: null,
        batch: new Set(), // Store changed filenames for batching
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
   * Handle file change event with batching and debouncing
   */
  handleFileChange(filePath, eventType, filename, window) {
    const watcherData = this.watchers.get(filePath);

    if (!watcherData) {
      return;
    }

    // Update last activity time for cleanup
    watcherData.lastActivity = Date.now();

    // Add filename to batch (normalize to null if undefined/empty)
    watcherData.batch.add(filename || null);

    // Clear existing timeout
    if (watcherData.timeout) {
      clearTimeout(watcherData.timeout);
    }

    // Set new timeout for debouncing
    watcherData.timeout = setTimeout(async () => {
      try {
        const batch = new Set(watcherData.batch);
        watcherData.batch.clear();
        watcherData.timeout = null; // Clear timeout reference

        const isDirectory = watcherData.metadata && watcherData.metadata.isDirectory;

        // Process based on whether we have specific filenames or just a general directory change
        // If we have specific filenames, check each one.
        // If the batch contains null (unknown file changed) or we are watching a file directly, check the watched path.

        const filesToCheck = new Set();

        if (isDirectory) {
          // If we have specific files, check them
          for (const fname of batch) {
            if (fname) {
              filesToCheck.add(path.join(filePath, fname));
            } else {
              // If we have a null filename (common on some OS/operations), it means "something changed in this dir"
              // We add the directory itself to check.
              filesToCheck.add(filePath);
            }
          }
        } else {
          // It is a file watcher, so the file itself changed
          filesToCheck.add(filePath);
        }

        // Validate and notify for each potentially changed file
        for (const fullPath of filesToCheck) {
          // Use the current window reference from watcherData, not the stale one from closure
          await this.checkAndNotifyChange(fullPath, watcherData.window);
        }

      } catch (error) {
        logger.error('Error handling file change:', error);
      }
    }, this.debounceDelay);
  }

  /**
   * Check a specific path state and notify if changed
   * @param {string} fullPath
   * @param {BrowserWindow} window
   */
  async checkAndNotifyChange(fullPath, window) {
    try {
      // Check availability
      const currentMetadata = await this.getFileMetadata(fullPath);

      if (!currentMetadata) {
        // Item was deleted
        this.notifyFileChange(window, {
          path: fullPath,
          event: 'unlink',
          type: 'unlink',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // If it exists, we treat it as a change (renames often come as change+rename pairs or just rename)
      // For the UI, we just want to know "something happened to this file"
      this.notifyFileChange(window, {
        path: fullPath,
        event: 'change', // Simplified event name
        type: 'changed',
        current: currentMetadata,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      logger.warn(`Failed to check path ${fullPath}: ${err.message}`);
    }
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
        isDirectory: stats.isDirectory(),
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
