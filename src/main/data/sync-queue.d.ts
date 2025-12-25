/**
 * Sync Queue
 * Manages offline operations with retry logic and exponential backoff
 */
/**
 * SyncQueue Class
 * Manages offline-first synchronization with automatic retry
 */
export declare class SyncQueue {
    constructor(options?: {});
    /**
     * Initialize sync queue
     */
    initialize(): Promise<void>;
    /**
     * Get queue from store
     */
    getQueue(): any;
    /**
     * Save queue to store
     */
    saveQueue(queue: any): void;
    /**
     * Add operation to queue
     * @param {object} operation - Operation to queue
     * @returns {Promise<object>} Result
     */
    enqueue(operation: any): Promise<{
        success: boolean;
        id: string;
        queued: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        id?: undefined;
        queued?: undefined;
    }>;
    /**
     * Process queue
     * @returns {Promise<object>} Result
     */
    process(): Promise<{
        success: boolean;
        message: string;
        processed?: undefined;
        failed?: undefined;
        pending?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        processed: number;
        failed: number;
        pending: any;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        processed?: undefined;
        failed?: undefined;
        pending?: undefined;
    }>;
    /**
     * Calculate exponential backoff delay
     */
    calculateBackoff(retries: any): number;
    /**
     * Get pending operations count
     */
    getPendingCount(): any;
    /**
     * Get queue status
     */
    getStatus(): {
        total: any;
        pending: number;
        syncing: number;
        synced: number;
        failed: number;
    };
    /**
     * Cleanup old synced operations
     */
    cleanup(): Promise<void>;
    /**
     * Clear all operations
     */
    clear(): Promise<{
        success: boolean;
    }>;
    /**
     * Generate unique operation ID
     */
    generateId(): string;
    /**
     * Set sync adapter
     */
    setAdapter(adapter: any): void;
}
declare const syncQueue: SyncQueue;
export default syncQueue;
