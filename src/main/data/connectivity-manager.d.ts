/**
 * Connectivity Manager
 * Monitors network connectivity and notifies renderer
 */
/**
 * ConnectivityManager Class
 * Manages network connectivity detection and monitoring
 */
export declare class ConnectivityManager {
    constructor(options?: {});
    /**
     * Initialize connectivity monitoring
     */
    initialize(): Promise<void>;
    /**
     * Check network connectivity
     * @returns {Promise<boolean>} Connection status
     */
    checkConnectivity(): Promise<unknown>;
    /**
     * Perform actual connectivity check
     */
    performConnectivityCheck(): Promise<unknown>;
    /**
     * Start periodic connectivity polling
     */
    startPolling(): void;
    /**
     * Stop connectivity polling
     */
    stopPolling(): void;
    /**
     * Notify windows of connectivity change
     */
    notifyConnectivityChange(isOnline: any): void;
    /**
     * Register connectivity change listener
     * @param {Function} listener - Callback function
     * @returns {Function} Cleanup function
     */
    addListener(listener: any): () => void;
    /**
     * Get current connectivity status
     * @returns {object} Status object
     */
    getStatus(): {
        online: any;
        checkUrl: any;
        lastCheck: number;
    };
    /**
     * Force connectivity check
     * @returns {Promise<object>} Status result
     */
    forceCheck(): Promise<{
        success: boolean;
        online: unknown;
        timestamp: number;
    }>;
    /**
     * Cleanup on app quit
     */
    cleanup(): void;
}
declare const connectivityManager: ConnectivityManager;
export default connectivityManager;
