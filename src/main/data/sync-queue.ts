/**
 * Sync Queue
 * Manages offline operations with retry logic and exponential backoff
 */

import Store from 'electron-store';
import { logger } from '../logger.ts';
import connectivityManager from './connectivity-manager.ts';
import { notificationManager } from '../notifications.ts';

const QUEUE_KEY = 'syncQueue';
const MAX_QUEUE_SIZE = 10000;
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000; // 1 second
const MAX_BACKOFF_MS = 32000; // 32 seconds
const PURGE_AFTER_DAYS = 7;
const BATCH_SIZE = 10; // Process max 10 operations at once
const CONCURRENT_LIMIT = 3; // Max 3 concurrent sync operations

/**
 * SyncQueue Class
 * Manages offline-first synchronization with automatic retry
 */
export class SyncQueue {
  constructor(options = {}) {
    this.store = new Store();
    this.maxQueueSize = options.maxQueueSize || MAX_QUEUE_SIZE;
    this.maxRetries = options.maxRetries || MAX_RETRIES;
    this.adapter = options.adapter || null; // Backend adapter
    this.processing = false;
    this.autoSync = options.autoSync !== false;

    // Listen for connectivity changes
    if (this.autoSync) {
      connectivityManager.addListener((online) => {
        if (online) {
          this.process();
        }
      });
    }
  }

  /**
   * Initialize sync queue
   */
  async initialize() {
    // Load queue from store
    const queue = this.getQueue();

    logger.info('Sync queue initialized', {
      operations: queue.length,
      maxSize: this.maxQueueSize
    });

    // Start processing if online
    if (this.autoSync && connectivityManager.isOnline) {
      await this.process();
    }
  }

  /**
   * Get queue from store
   */
  getQueue() {
    return this.store.get(QUEUE_KEY, []);
  }

  /**
   * Save queue to store
   */
  saveQueue(queue) {
    this.store.set(QUEUE_KEY, queue);
  }

  /**
   * Add operation to queue
   * @param {object} operation - Operation to queue
   * @returns {Promise<object>} Result
   */
  async enqueue(operation) {
    try {
      const queue = this.getQueue();

      // Check queue size limit
      if (queue.length >= this.maxQueueSize) {
        return {
          success: false,
          error: `Queue is full (max ${this.maxQueueSize} operations)`
        };
      }

      // Create operation entry
      const entry = {
        id: this.generateId(),
        type: operation.type,
        entity: operation.entity,
        data: operation.data,
        status: 'pending',
        retries: 0,
        timestamp: Date.now(),
        lastAttempt: null,
        error: null
      };

      // Add to queue
      queue.push(entry);
      this.saveQueue(queue);

      logger.info('Operation queued', {
        id: entry.id,
        type: entry.type,
        entity: entry.entity
      });

      // Try to process immediately if online
      if (this.autoSync && connectivityManager.isOnline && !this.processing) {
        setImmediate(() => this.process());
      }

      return {
        success: true,
        id: entry.id,
        queued: queue.length
      };
    } catch (error) {
      logger.error('Failed to enqueue operation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process queue
   * @returns {Promise<object>} Result
   */
  async process() {
    // Prevent concurrent processing
    if (this.processing) {
      return {
        success: false,
        message: 'Already processing'
      };
    }

    // Check if online
    if (!connectivityManager.isOnline) {
      return {
        success: false,
        message: 'Offline - sync paused'
      };
    }

    // Check if adapter is configured
    if (!this.adapter) {
      return {
        success: false,
        error: 'No sync adapter configured'
      };
    }

    this.processing = true;
    const startTime = Date.now(); // Start profiling
    const startMemory = process.memoryUsage();

    logger.info('Starting queue processing', {
      memory: {
        heapUsed: Math.round(startMemory.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(startMemory.heapTotal / 1024 / 1024) + ' MB'
      }
    });

    try {
      const queue = this.getQueue();
      let processed = 0;
      let failed = 0;

      // Filter pending operations ready to process
      const pendingOps = queue.filter(op => {
        if (op.status !== 'pending') return false;

        // Skip if max retries exceeded
        if (op.retries >= this.maxRetries) {
          op.status = 'failed';
          op.error = 'Max retries exceeded';
          failed++;
          return false;
        }

        // Check backoff delay
        if (op.lastAttempt) {
          const delay = this.calculateBackoff(op.retries);
          const timeSinceLastAttempt = Date.now() - op.lastAttempt;
          if (timeSinceLastAttempt < delay) return false;
        }

        return true;
      });

      // Process in batches with concurrency limit
      for (let i = 0; i < pendingOps.length; i += BATCH_SIZE) {
        const batch = pendingOps.slice(i, i + BATCH_SIZE);

        // Process batch with concurrency limit
        for (let j = 0; j < batch.length; j += CONCURRENT_LIMIT) {
          const chunk = batch.slice(j, j + CONCURRENT_LIMIT);

          await Promise.all(chunk.map(async (operation) => {
            try {
              operation.lastAttempt = Date.now();
              operation.retries++;

              const result = await this.adapter.sync(operation);

              if (result.success) {
                operation.status = 'synced';
                operation.syncedAt = Date.now();
                processed++;

                logger.info('Operation synced', {
                  id: operation.id,
                  type: operation.type
                });
              } else {
                operation.error = result.error;

                logger.warn('Operation sync failed', {
                  id: operation.id,
                  error: result.error,
                  retries: operation.retries
                });
              }
            } catch (error) {
              operation.error = error.message;

              logger.error('Operation sync error:', {
                id: operation.id,
                error: error.message
              });
            }
          }));
        }

        // Save progress after each batch
        this.saveQueue(queue);
      }

      // Cleanup old synced operations
      await this.cleanup();

      // Performance profiling
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      const duration = endTime - startTime;
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      logger.info('Queue processing complete', {
        processed,
        failed,
        remaining: this.getPendingCount(),
        performance: {
          duration: duration + 'ms',
          memoryDelta: Math.round(memoryDelta / 1024 / 1024) + ' MB',
          heapUsed: Math.round(endMemory.heapUsed / 1024 / 1024) + ' MB',
          opsPerSecond: processed > 0 ? Math.round((processed / duration) * 1000) : 0
        }
      });

      // Trigger garbage collection if available (dev mode)
      if (global.gc && memoryDelta > 10 * 1024 * 1024) { // >10MB increase
        logger.debug('Triggering garbage collection');
        global.gc();
      }

      // Notify if items were processed or failed
      if (processed > 0) {
        notificationManager.showNotification({
          title: 'Sync Complete',
          body: `Successfully synced ${processed} item${processed === 1 ? '' : 's'}${failed > 0 ? `. ${failed} failed.` : '.'}`,
          urgency: 'normal'
        });
      }

      if (failed > 0 && processed === 0) {
        notificationManager.showNotification({
          title: 'Sync Warning',
          body: `Failed to sync ${failed} item${failed === 1 ? '' : 's'}. Will retry later.`,
          urgency: 'normal'
        });
      }

      return {
        success: true,
        processed,
        failed,
        pending: this.getPendingCount()
      };
    } catch (error) {
      logger.error('Queue processing failed:', error);

      notificationManager.showNotification({
        title: 'Sync Failed',
        body: `Sync process encountered an error: ${error.message}`,
        urgency: 'critical'
      });

      return {
        success: false,
        error: error.message
      };
    } finally {
      this.processing = false;
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  calculateBackoff(retries) {
    const delay = INITIAL_BACKOFF_MS * Math.pow(2, retries);
    return Math.min(delay, MAX_BACKOFF_MS);
  }

  /**
   * Get pending operations count
   */
  getPendingCount() {
    const queue = this.getQueue();
    return queue.filter(op => op.status === 'pending').length;
  }

  /**
   * Get queue status
   */
  getStatus() {
    const queue = this.getQueue();

    const status = {
      total: queue.length,
      pending: 0,
      syncing: 0,
      synced: 0,
      failed: 0
    };

    for (const operation of queue) {
      status[operation.status]++;
    }

    return status;
  }

  /**
   * Cleanup old synced operations
   */
  async cleanup() {
    const queue = this.getQueue();
    const cutoff = Date.now() - (PURGE_AFTER_DAYS * 24 * 60 * 60 * 1000);

    const filtered = queue.filter(op => {
      // Keep pending and failed operations
      if (op.status === 'pending' || op.status === 'failed') {
        return true;
      }

      // Remove old synced operations
      if (op.status === 'synced' && op.syncedAt < cutoff) {
        return false;
      }

      return true;
    });

    if (filtered.length !== queue.length) {
      this.saveQueue(filtered);
      logger.info('Cleaned up queue', {
        removed: queue.length - filtered.length,
        remaining: filtered.length
      });
    }
  }

  /**
   * Clear all operations
   */
  async clear() {
    this.saveQueue([]);
    logger.info('Queue cleared');

    return {
      success: true
    };
  }

  /**
   * Generate unique operation ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set sync adapter
   */
  setAdapter(adapter) {
    this.adapter = adapter;
    logger.info('Sync adapter configured');
  }
}

// Create singleton instance
const syncQueue = new SyncQueue();

export default syncQueue;
