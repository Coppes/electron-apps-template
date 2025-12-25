/**
 * IPC Parameter Validation Helper
 * Validates IPC parameters against schemas to prevent injection attacks
 */

import { logger } from '../logger.ts';

/**
 * Validate parameter against schema
 * @param {any} value - Value to validate
 * @param {object} schema - Schema definition
 * @param {string} paramName - Parameter name for error messages
 * @returns {object} Validation result
 */
export function validateParameter(value, schema, paramName) {
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
 * @param {object} params - Parameters to validate
 * @param {object} schema - Schema definition
 * @returns {object} Validation result
 */
export function validateParameters(params, schema) {
  if (!schema) {
    return { valid: true };
  }

  const errors = [];

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

/**
 * Middleware wrapper for IPC handlers with validation
 * @param {Function} handler - Handler function
 * @param {object} schema - Schema for validation
 * @returns {Function} Wrapped handler with validation
 */
export function withValidation(handler, schema) {
  return async (event, params) => {
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
      logger.error('IPC handler error', {
        handler: handler.name,
        error: error.message,
        stack: error.stack
      });
      
      return {
        success: false,
        error: error.message,
        code: 'HANDLER_ERROR'
      };
    }
  };
}

/**
 * Sanitize IPC parameters to remove potentially dangerous values
 * @param {object} params - Parameters to sanitize
 * @returns {object} Sanitized parameters
 */
export function sanitizeParameters(params) {
  if (!params || typeof params !== 'object') {
    return params;
  }

  const sanitized = {};

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
