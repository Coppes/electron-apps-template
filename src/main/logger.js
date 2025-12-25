import log from 'electron-log';
import { app } from 'electron';
import { join } from 'path';
import { LOG_LEVELS, ENV } from '../common/constants.ts';
/**
 * Enhanced logging system with levels, timestamps, and configurable outputs
 */
// Configure log file location
log.transports.file.resolvePathFn = () => {
    return join(app.getPath('userData'), 'logs', 'main.log');
};
// Configure log format
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.console.format = '[{h}:{i}:{s}.{ms}] [{level}] {text}';
// Configure log level based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
log.transports.file.level = 'info';
log.transports.console.level = isDevelopment ? 'debug' : 'info';
// File rotation configuration
log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB
/**
 * Logger wrapper with structured logging support
 */
class Logger {
    /**
     * Log debug message (development only)
     * @param {string} message - Log message
     * @param {Object} [meta] - Additional metadata
     */
    debug(message, meta = {}) {
        if (Object.keys(meta).length > 0) {
            log.debug(message, meta);
        }
        else {
            log.debug(message);
        }
    }
    /**
     * Log info message
     * @param {string} message - Log message
     * @param {Object} [meta] - Additional metadata
     */
    info(message, meta = {}) {
        if (Object.keys(meta).length > 0) {
            log.info(message, meta);
        }
        else {
            log.info(message);
        }
    }
    /**
     * Log warning message
     * @param {string} message - Log message
     * @param {Object} [meta] - Additional metadata
     */
    warn(message, meta = {}) {
        if (Object.keys(meta).length > 0) {
            log.warn(message, meta);
        }
        else {
            log.warn(message);
        }
    }
    /**
     * Log error message
     * @param {string} message - Log message
     * @param {Error|Object} [error] - Error object or metadata
     */
    error(message, error = {}) {
        if (error instanceof Error) {
            log.error(message, { message: error.message, stack: error.stack });
        }
        else if (Object.keys(error).length > 0) {
            log.error(message, error);
        }
        else {
            log.error(message);
        }
    }
    /**
     * Get log file path
     * @returns {string} Path to log file
     */
    getLogPath() {
        return log.transports.file.getFile().path;
    }
    /**
     * Set log level for console transport
     * @param {string} level - Log level (debug, info, warn, error)
     */
    setConsoleLevel(level) {
        if (Object.values(LOG_LEVELS).includes(level)) {
            log.transports.console.level = level;
            this.info(`Console log level set to: ${level}`);
        }
        else {
            this.warn(`Invalid log level: ${level}`);
        }
    }
    /**
     * Set log level for file transport
     * @param {string} level - Log level (debug, info, warn, error)
     */
    setFileLevel(level) {
        if (Object.values(LOG_LEVELS).includes(level)) {
            log.transports.file.level = level;
            this.info(`File log level set to: ${level}`);
        }
        else {
            this.warn(`Invalid log level: ${level}`);
        }
    }
    /**
     * Get the underlying electron-log instance
     * @returns {Object} electron-log instance
     */
    getLogInstance() {
        return log;
    }
}
// Export singleton instance
export const logger = new Logger();
// Log initialization
logger.info('Logger initialized', {
    environment: isDevelopment ? ENV.DEVELOPMENT : ENV.PRODUCTION,
    logPath: logger.getLogPath(),
    consoleLevel: log.transports.console.level,
    fileLevel: log.transports.file.level,
});
