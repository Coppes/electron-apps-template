/**
 * Application Lifecycle Manager
 * Handles ordered initialization, graceful shutdown, single instance lock, and crash recovery
 */
export declare class LifecycleManager {
    constructor();
    /**
     * Initialize application in correct order
     */
    startup(): Promise<void>;
    /**
     * Register all IPC handlers
     */
    registerIPC(): Promise<void>;
    /**
     * Initialize OS integration features
     */
    initializeOSIntegration(): Promise<void>;
    /**
     * Graceful shutdown sequence
     */
    shutdown(): Promise<void>;
    /**
     * Flush log buffers
     */
    flushLogs(): Promise<unknown>;
    /**
     * Setup single instance lock
     * @returns {boolean} True if this is the first instance
     */
    setupSingleInstance(): boolean;
    /**
     * Create crash marker file
     */
    createCrashMarker(): Promise<void>;
    /**
     * Remove crash marker file
     */
    removeCrashMarker(): Promise<void>;
    /**
     * Check for crash marker and handle recovery
     */
    checkCrashRecovery(): Promise<void>;
    /**
     * Setup deep linking protocol
     */
    setupDeepLinking(): void;
    /**
     * Handle deep link URL
     * @param {string} url - Deep link URL
     */
    handleDeepLink(url: any): void;
    /**
     * Setup file handling (macOS open-file, etc.)
     */
    setupFileHandling(): void;
    /**
     * Match deep link to a route
     * @param {string} host - URL host/action
     * @param {string[]} pathSegments - Path segments
     * @param {Object} deepLinkData - Deep link data object
     * @returns {string|null} Matched route
     */
    matchRoute(host: any, pathSegments: any, deepLinkData: any): any;
}
export declare const lifecycleManager: LifecycleManager;
