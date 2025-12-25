/**
 * IPC Parameter Validation Helper
 * Validates IPC parameters against schemas to prevent injection attacks
 */
/**
 * Validate parameter against schema
 * @param {any} value - Value to validate
 * @param {object} schema - Schema definition
 * @param {string} paramName - Parameter name for error messages
 * @returns {object} Validation result
 */
export declare function validateParameter(value: any, schema: any, paramName: any): {
    valid: boolean;
    error: string;
    code: string;
} | {
    valid: boolean;
    error?: undefined;
    code?: undefined;
};
/**
 * Validate all parameters against schema
 * @param {object} params - Parameters to validate
 * @param {object} schema - Schema definition
 * @returns {object} Validation result
 */
export declare function validateParameters(params: any, schema: any): {
    valid: boolean;
    errors?: undefined;
    message?: undefined;
} | {
    valid: boolean;
    errors: any[];
    message: string;
};
/**
 * Middleware wrapper for IPC handlers with validation
 * @param {Function} handler - Handler function
 * @param {object} schema - Schema for validation
 * @returns {Function} Wrapped handler with validation
 */
export declare function withValidation(handler: any, schema: any): (event: any, params: any) => Promise<any>;
/**
 * Sanitize IPC parameters to remove potentially dangerous values
 * @param {object} params - Parameters to sanitize
 * @returns {object} Sanitized parameters
 */
export declare function sanitizeParameters(params: any): any;
