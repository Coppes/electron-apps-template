/**
 * Error handling framework
 * Handles uncaught exceptions, unhandled rejections, and provides error reporting
 */
/**
 * Setup global error handlers
 */
export declare function setupErrorHandlers(): void;
/**
 * Show error dialog to user
 * @param {string} title - Dialog title
 * @param {string} message - Error message
 */
export declare function showErrorDialog(title: any, message: any): void;
/**
 * Create error report
 * @param {Error} error - Error object
 * @returns {Object} Error report with diagnostics
 */
export declare function createErrorReport(error: any): {
    message: any;
    stack: any;
    name: any;
    timestamp: string;
    diagnostics: {
        app: {
            version: string;
            name: string;
            locale: string;
        };
        system: {
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
            version: string;
        };
        versions: {
            electron: string;
            chrome: string;
            node: string;
            v8: string;
        };
        memory: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
            external: number;
        };
        uptime: number;
    };
};
/**
 * Get system diagnostics
 * @returns {Object} Diagnostic information
 */
export declare function getDiagnostics(): {
    app: {
        version: string;
        name: string;
        locale: string;
    };
    system: {
        platform: NodeJS.Platform;
        arch: NodeJS.Architecture;
        version: string;
    };
    versions: {
        electron: string;
        chrome: string;
        node: string;
        v8: string;
    };
    memory: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
    };
    uptime: number;
};
/**
 * Handle renderer process crash
 * @param {BrowserWindow} window - Crashed window
 */
export declare function handleRendererCrash(window: any): void;
/**
 * Setup renderer crash handling for window
 * @param {BrowserWindow} window - Window instance
 */
export declare function setupRendererCrashHandler(window: any): void;
/**
 * Log startup errors
 * @param {Error} error - Startup error
 */
export declare function logStartupError(error: any): void;
