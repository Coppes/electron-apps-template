/**
 * Mock Sync Adapter
 * Simple adapter for testing sync queue without real backend
 */
import { logger } from '../logger.ts';
/**
 * MockAdapter Class
 * Simulates backend sync operations
 */
export class MockAdapter {
    constructor(options = {}) {
        this.delay = options.delay || 100; // Simulate network delay
        this.failRate = options.failRate || 0; // 0-1, probability of failure
        this.syncedOperations = [];
    }
    /**
     * Sync operation (mock implementation)
     * @param {object} operation - Operation to sync
     * @returns {Promise<object>} Result
     */
    async sync(operation) {
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
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
export default MockAdapter;
