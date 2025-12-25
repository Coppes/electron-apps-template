/**
 * Register IPC handler with validation
 * @param {string} channel - IPC channel name
 * @param {Object} schema - Channel schema
 * @param {Function} handler - Handler function
 */
export declare function registerHandler(channel: any, schema: any, handler: any): void;
/**
 * Register multiple handlers from schema
 * @param {Object} schema - Schema with handlers
 * @param {Object} handlers - Handler functions keyed by channel
 */
export declare function registerHandlers(schema: any, handlers: any): void;
/**
 * Remove IPC handler
 * @param {string} channel - Channel name
 */
export declare function removeHandler(channel: any): void;
/**
 * Remove all IPC handlers
 */
export declare function removeAllHandlers(): void;
/**
 * Create standard error response
 * @param {string} message - Error message
 * @param {string} [code] - Error code
 * @returns {Object} Error response
 */
export declare function createErrorResponse(message: any, code?: string): {
    success: boolean;
    error: any;
    code: string;
};
/**
 * Create standard success response
 * @param {Object} data - Response data
 * @returns {Object} Success response
 */
export declare function createSuccessResponse(data?: {}): {
    success: boolean;
};
