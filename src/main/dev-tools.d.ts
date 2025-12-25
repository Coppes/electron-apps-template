/**
 * Developer tools and DevTools integration
 */
/**
 * Setup DevTools for window
 * @param {BrowserWindow} window - Window instance
 */
export declare function setupDevTools(window: any): void;
/**
 * Install React DevTools extension
 */
export declare function installReactDevTools(): Promise<void>;
/**
 * Enable hot reload for main process
 * This watches for changes in main process files and restarts Electron
 */
export declare function enableMainProcessHMR(): void;
/**
 * Setup performance monitoring
 */
export declare function setupPerformanceMonitoring(): void;
/**
 * Log environment info
 */
export declare function logEnvironmentInfo(): void;
