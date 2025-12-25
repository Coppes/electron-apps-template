/**
 * Mock Sync Adapter
 * Simple adapter for testing sync queue without real backend
 */
/**
 * MockAdapter Class
 * Simulates backend sync operations
 */
export declare class MockAdapter {
    constructor(options?: {});
    /**
     * Sync operation (mock implementation)
     * @param {object} operation - Operation to sync
     * @returns {Promise<object>} Result
     */
    sync(operation: any): Promise<{
        success: boolean;
        error: string;
        id?: undefined;
    } | {
        success: boolean;
        id: any;
        error?: undefined;
    }>;
    /**
     * Get synced operations
     */
    getSyncedOperations(): any;
    /**
     * Clear synced operations
     */
    clear(): void;
    /**
     * Sleep helper
     */
    sleep(ms: any): Promise<unknown>;
}
export default MockAdapter;
