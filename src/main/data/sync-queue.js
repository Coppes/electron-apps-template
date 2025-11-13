/**
 * Sync Queue
 * Offline-first synchronization queue with retry logic
 */

import Store from 'electron-store';
import { logger } from '../logger.js';
import connectivityManager from './connectivity-manager.js';

const QUEUE_KEY = 'sync:queue';
const MAX_QUEUE_SIZE = 10000;
const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 60000; // 60 seconds

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
    logger.info('Starting queue processing');

    try {
      const queue = this.getQueue();
      let processed = 0;
      let failed = 0;

      // Process pending operations
      for (const operation of queue) {
        if (operation.status !== 'pending') {
          continue;
        }

        // Check if should retry
        if (operation.retries >= this.maxRetries) {
          operation.status = 'failed';
          operation.error = 'Max retries exceeded';
          failed++;
          continue;
        }

        // Calculate backoff delay
        if (operation.lastAttempt) {
          const delay = this.calculateBackoff(operation.retries);
          const timeSinceLastAttempt = Date.now() - operation.lastAttempt;
          
          if (timeSinceLastAttempt < delay) {
            continue; // Skip, not ready to retry yet
          }
        }

        // Try to sync operation
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

        // Save progress
        this.saveQueue(queue);
      }

      // Cleanup old synced operations
      await this.cleanup();

      logger.info('Queue processing complete', {
        processed,
        failed,
        remaining: this.getPendingCount()
      });

      return {
        success: true,
        processed,
        failed,
        pending: this.getPendingCount()
      };
    } catch (error) {
      logger.error('Queue processing failed:', error);
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
    const delay = BASE_DELAY * Math.pow(2, retries);
    return Math.min(delay, MAX_DELAY);
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
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days

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
