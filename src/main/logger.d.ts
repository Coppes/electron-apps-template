import log from 'electron-log';
/**
 * Logger wrapper with structured logging support
 */
declare class Logger {
    /**
     * Log debug message (development only)
     * @param {string} message - Log message
     * @param {Object} [meta] - Additional metadata
     */
    debug(message: any, meta?: {}): void;
    /**
     * Log info message
     * @param {string} message - Log message
     * @param {Object} [meta] - Additional metadata
     */
    info(message: any, meta?: {}): void;
    /**
     * Log warning message
     * @param {string} message - Log message
     * @param {Object} [meta] - Additional metadata
     */
    warn(message: any, meta?: {}): void;
    /**
     * Log error message
     * @param {string} message - Log message
     * @param {Error|Object} [error] - Error object or metadata
     */
    error(message: any, error?: {}): void;
    /**
     * Get log file path
     * @returns {string} Path to log file
     */
    getLogPath(): string;
    /**
     * Set log level for console transport
     * @param {string} level - Log level (debug, info, warn, error)
     */
    setConsoleLevel(level: any): void;
    /**
     * Set log level for file transport
     * @param {string} level - Log level (debug, info, warn, error)
     */
    setFileLevel(level: any): void;
    /**
     * Get the underlying electron-log instance
     * @returns {Object} electron-log instance
     */
    getLogInstance(): log.MainLogger & {
        default: log.MainLogger;
    };
}
export declare const logger: Logger;
export {};
