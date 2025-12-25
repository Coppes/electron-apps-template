/**
 * File Watcher Service
 * Monitors external file changes and notifies renderer
 */
/**
 * FileWatcher Class
 * Manages file watching with debouncing and conflict detection
 */
export declare class FileWatcher {
    constructor(options?: {});
    /**
     * Initialize file watcher with periodic cleanup
     */
    initialize(): void;
    /**
     * Start periodic memory cleanup
     */
    startCleanup(): void;
    /**
     * Stop cleanup timer
     */
    stopCleanup(): void;
    /**
     * Perform memory cleanup
     */
    performCleanup(): void;
    /**
     * Start watching a file
     * @param {string} filePath - Path to file to watch
     * @param {BrowserWindow} window - Window to notify
     * @returns {Promise<object>} Result
     */
    watch(filePath: any, window: any): Promise<{
        success: boolean;
        message: string;
        path: string;
        metadata?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        path: string;
        metadata: {
            size: number;
            mtime: number;
            isDirectory: boolean;
            exists: boolean;
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        path?: undefined;
        metadata?: undefined;
    }>;
    /**
     * Stop watching a file
     * @param {string} filePath - Path to file
     * @returns {Promise<object>} Result
     */
    unwatch(filePath: any): Promise<{
        success: boolean;
        message: string;
        path?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        path: string;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        path?: undefined;
    }>;
    /**
     * Handle file change event with batching and debouncing
     */
    handleFileChange(filePath: any, eventType: any, filename: any): void;
    /**
     * Check a specific path state and notify if changed
     * @param {string} fullPath
     * @param {BrowserWindow} window
     */
    checkAndNotifyChange(fullPath: any, window: any): Promise<void>;
    /**
     * Get file metadata
     */
    getFileMetadata(filePath: any): Promise<{
        size: number;
        mtime: number;
        isDirectory: boolean;
        exists: boolean;
    }>;
    /**
     * Check if file has changed
     */
    hasFileChanged(previous: any, current: any): boolean;
    /**
     * Notify window of file change
     */
    notifyFileChange(window: any, data: any): void;
    /**
     * Get list of watched files
     */
    getWatchedFiles(): unknown[];
    /**
     * Stop watching all files
     */
    unwatchAll(): Promise<{
        success: boolean;
        count: number;
    }>;
    /**
     * Cleanup on app quit
     */
    cleanup(): Promise<void>;
}
declare const fileWatcher: FileWatcher;
export default fileWatcher;
