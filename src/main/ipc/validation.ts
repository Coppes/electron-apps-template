/**
 * IPC Parameter Validation Helper
 * Validates IPC parameters against schemas to prevent injection attacks
 */

import { logger } from '../logger.ts';

interface ValidationSchema {
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: (string | number)[];
  maxLength?: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  errors?: any[];
  message?: string;
}

/**
 * Validate parameter against schema
 * @param {any} value - Value to validate
 * @param {ValidationSchema} schema - Schema definition
 * @param {string} paramName - Parameter name for error messages
 * @returns {ValidationResult} Validation result
 */
export function validateParameter(value: any, schema: ValidationSchema, paramName: string): ValidationResult {
  const { type, required, min, max, pattern, enum: enumValues, maxLength } = schema;

  // Check if required
  if (required && (value === undefined || value === null)) {
    return {
      valid: false,
      error: `Parameter '${paramName}' is required`,
      code: 'REQUIRED_PARAMETER'
    };
  }

  // If not required and not provided, it's valid
  if (!required && (value === undefined || value === null)) {
    return { valid: true };
  }

  // Type validation
  const actualType = Array.isArray(value) ? 'array' : typeof value;
  if (type && actualType !== type) {
    return {
      valid: false,
      error: `Parameter '${paramName}' must be of type ${type}, got ${actualType}`,
      code: 'INVALID_TYPE'
    };
  }

  // String validations
  if (type === 'string') {
    // Max length
    if (maxLength && value.length > maxLength) {
      return {
        valid: false,
        error: `Parameter '${paramName}' exceeds maximum length of ${maxLength}`,
        code: 'STRING_TOO_LONG'
      };
    }

    // Pattern matching
    if (pattern && !new RegExp(pattern).test(value)) {
      return {
        valid: false,
        error: `Parameter '${paramName}' does not match required pattern`,
        code: 'PATTERN_MISMATCH'
      };
    }

    // Enum validation
    if (enumValues && !enumValues.includes(value)) {
      return {
        valid: false,
        error: `Parameter '${paramName}' must be one of: ${enumValues.join(', ')}`,
        code: 'INVALID_ENUM_VALUE'
      };
    }
  }

  // Number validations
  if (type === 'number') {
    if (min !== undefined && value < min) {
      return {
        valid: false,
        error: `Parameter '${paramName}' must be at least ${min}`,
        code: 'NUMBER_TOO_SMALL'
      };
    }

    if (max !== undefined && value > max) {
      return {
        valid: false,
        error: `Parameter '${paramName}' must be at most ${max}`,
        code: 'NUMBER_TOO_LARGE'
      };
    }
  }

  // Array validations
  if (type === 'array') {
    if (min !== undefined && value.length < min) {
      return {
        valid: false,
        error: `Parameter '${paramName}' must have at least ${min} items`,
        code: 'ARRAY_TOO_SHORT'
      };
    }

    if (max !== undefined && value.length > max) {
      return {
        valid: false,
        error: `Parameter '${paramName}' must have at most ${max} items`,
        code: 'ARRAY_TOO_LONG'
      };
    }
  }

  return { valid: true };
}

/**
 * Validate all parameters against schema
 * @param {Record<string, any>} params - Parameters to validate
 * @param {Record<string, ValidationSchema>} schema - Schema definition
 * @returns {ValidationResult} Validation result
 */
export function validateParameters(params: Record<string, any>, schema: Record<string, ValidationSchema>): ValidationResult {
  if (!schema) {
    return { valid: true };
  }

  const errors: any[] = [];

  // Validate each parameter in schema
  for (const [paramName, paramSchema] of Object.entries(schema)) {
    const value = params?.[paramName];
    const result = validateParameter(value, paramSchema, paramName);

    if (!result.valid) {
      errors.push({
        param: paramName,
        error: result.error,
        code: result.code
      });
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      message: `Validation failed: ${errors.map(e => e.error).join('; ')}`
    };
  }

  return { valid: true };
}

interface ValidatedHandlerResponse {
  success: boolean;
  error?: string;
  code?: string;
  validationErrors?: any[];
}

/**
 * Middleware wrapper for IPC handlers with validation
 * @param {Function} handler - Handler function
 * @param {object} schema - Schema for validation
 * @returns {Function} Wrapped handler with validation
 */
export function withValidation(handler: Function, schema: { input: Record<string, ValidationSchema> }) {
  return async (event: unknown, params: Record<string, any>): Promise<ValidatedHandlerResponse | any> => {
    // Validate parameters
    const validation = validateParameters(params, schema?.input);

    if (!validation.valid) {
      logger.warn('IPC parameter validation failed', {
        handler: handler.name,
        errors: validation.errors
      });

      return {
        success: false,
        error: validation.message,
        code: 'VALIDATION_ERROR',
        validationErrors: validation.errors
      };
    }

    // Call original handler
    try {
      return await handler(event, params);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      logger.error('IPC handler error', {
        handler: handler.name,
        error: message,
        stack
      });

      return {
        success: false,
        error: message,
        code: 'HANDLER_ERROR'
      };
    }
  };
}

/**
 * Sanitize IPC parameters to remove potentially dangerous values
 * @param {any} params - Parameters to sanitize
 * @returns {any} Sanitized parameters
 */
export function sanitizeParameters(params: any): any {
  if (!params || typeof params !== 'object') {
    return params;
  }

  // Handle null (typeof null is 'object')
  if (params === null) {
    return null;
  }

  const sanitized: any = Array.isArray(params) ? [] : {};

  for (const [key, value] of Object.entries(params)) {
    // Skip null/undefined
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }

    // Sanitize strings
    if (typeof value === 'string') {
      // Remove null bytes
      sanitized[key] = value.replace(/\0/g, '');
    }
    // Recursively sanitize objects
    else if (typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeParameters(value);
    }
    // Sanitize arrays
    else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'object' ? sanitizeParameters(item) : item
      );
    }
    // Other types pass through
    else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
