import { DataAdapter, SyncOperation, SyncResult } from '../../../common/types.ts';
import { logger } from '../../logger.ts';

interface MockAdapterOptions {
  delay?: number;
  failRate?: number;
}

/**
 * MockAdapter Class
 * Simulates backend sync operations
 */
export class MockAdapter implements DataAdapter {
  private delay: number;
  private failRate: number;
  private syncedOperations: (SyncOperation & { syncedAt: number })[];

  constructor(options: MockAdapterOptions = {}) {
    this.delay = options.delay || 100; // Simulate network delay
    this.failRate = options.failRate || 0; // 0-1, probability of failure
    this.syncedOperations = [];
  }

  /**
   * Sync operation (mock implementation)
   */
  async sync(operation: SyncOperation): Promise<SyncResult> {
    // Simulate network delay
    await this.sleep(this.delay);

    // Simulate random failures
    if (Math.random() < this.failRate) {
      logger.debug('Mock sync failed (simulated)', { id: operation.id });
      return {
        success: false,
        error: 'Simulated network error'
      };
    }

    // Store synced operation
    this.syncedOperations.push({
      ...operation,
      syncedAt: Date.now()
    });

    logger.debug('Mock sync succeeded', {
      id: operation.id,
      type: operation.type
    });

    return {
      success: true,
      id: operation.id
    };
  }

  /**
   * Get synced operations
   */
  getSyncedOperations() {
    return this.syncedOperations;
  }

  /**
   * Clear synced operations
   */
  clear() {
    this.syncedOperations = [];
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MockAdapter;
