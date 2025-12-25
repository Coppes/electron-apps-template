/**
 * Security Utilities for Data Management
 * Centralized security validation and sanitization
 */
/**
 * Validate file path for security vulnerabilities
 * @param {string} filePath - Path to validate
 * @param {object} options - Validation options
 * @returns {object} Validation result
 */
export declare function validateFilePath(filePath: any, options?: {}): {
    valid: boolean;
    error: string;
    code: string;
    allowedExtensions?: undefined;
    resolvedPath?: undefined;
    normalizedPath?: undefined;
    extension?: undefined;
    maxSize?: undefined;
} | {
    valid: boolean;
    error: string;
    code: string;
    allowedExtensions: any;
    resolvedPath?: undefined;
    normalizedPath?: undefined;
    extension?: undefined;
    maxSize?: undefined;
} | {
    valid: boolean;
    resolvedPath: string;
    normalizedPath: string;
    extension: string;
    maxSize: any;
    error?: undefined;
    code?: undefined;
    allowedExtensions?: undefined;
};
/**
 * Sanitize filename for safe storage
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export declare function sanitizeFilename(filename: any): string;
/**
 * Sanitize HTML/Markdown content to prevent XSS
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
export declare function sanitizeContent(content: any): string;
/**
 * Validate imported data structure
 * @param {any} data - Data to validate
 * @param {object} schema - Expected schema
 * @returns {object} Validation result
 */
export declare function validateImportData(data: any, schema?: {}): {
    valid: boolean;
    error: string;
    code: string;
} | {
    valid: boolean;
    error?: undefined;
    code?: undefined;
};
/**
 * Rate limiter for file operations
 */
export declare class RateLimiter {
    constructor(options?: {});
    /**
     * Check if request is allowed
     * @param {string} key - Unique identifier for rate limit (e.g., operation type)
     * @returns {boolean} True if allowed
     */
    isAllowed(key: any): boolean;
    /**
     * Get remaining requests for a key
     * @param {string} key - Unique identifier
     * @returns {number} Remaining requests
     */
    getRemaining(key: any): number;
    /**
     * Reset rate limit for a key
     * @param {string} key - Unique identifier
     */
    reset(key: any): void;
    /**
     * Clear all rate limits
     */
    clearAll(): void;
}
export declare const fileOperationLimiter: RateLimiter;
export declare const backupLimiter: RateLimiter;
export declare const importExportLimiter: RateLimiter;
