import { ipcMain } from 'electron';
import { logger } from '../logger.ts';

/**
 * IPC Bridge - Validates and routes IPC calls
 */

/**
 * Validate input against schema
 * @param {*} input - Input value to validate
 * @param {Object} schema - Schema definition
 * @returns {Object} Validation result {valid: boolean, errors: Array}
 */
function validateInput(input, schema) {
  const errors = [];

  // If no schema, accept any input
  if (!schema || Object.keys(schema).length === 0) {
    return { valid: true, errors: [] };
  }

  // Check required fields
  for (const [field, rules] of Object.entries(schema)) {
    const value = input?.[field];
    
    if (rules.required && (value === undefined || value === null)) {
      errors.push({
        field,
        message: `Field '${field}' is required`,
        expected: rules.type,
        received: typeof value,
      });
      continue;
    }

    // Skip type checking for optional fields that are not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    if (rules.type !== 'any') {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type && rules.type !== 'object') {
        errors.push({
          field,
          message: `Field '${field}' has wrong type`,
          expected: rules.type,
          received: actualType,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate output against schema
 * @param {*} output - Output value to validate
 * @param {Object} schema - Schema definition
 * @returns {Object} Validation result {valid: boolean, errors: Array}
 */
function validateOutput(output, schema) {
  const errors = [];

  if (!schema || Object.keys(schema).length === 0) {
    return { valid: true, errors: [] };
  }

  for (const [field, rules] of Object.entries(schema)) {
    const value = output?.[field];
    
    if (rules.required && (value === undefined || value === null)) {
      errors.push({
        field,
        message: `Output field '${field}' is required`,
        expected: rules.type,
        received: typeof value,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Register IPC handler with validation
 * @param {string} channel - IPC channel name
 * @param {Object} schema - Channel schema
 * @param {Function} handler - Handler function
 */
export function registerHandler(channel, schema, handler) {
  ipcMain.handle(channel, async (event, ...args) => {
    const startTime = Date.now();
    
    try {
      // Parse input (first arg is typically the input object)
      const input = args[0];

      // Validate input
      const inputValidation = validateInput(input, schema.input);
      if (!inputValidation.valid) {
        logger.warn(`IPC input validation failed for ${channel}`, {
          errors: inputValidation.errors,
          input,
        });
        return {
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: inputValidation.errors,
        };
      }

      // Execute handler
      logger.debug(`IPC call: ${channel}`, { input });
      const result = await handler(event, ...args);

      // Validate output
      const outputValidation = validateOutput(result, schema.output);
      if (!outputValidation.valid) {
        logger.error(`IPC output validation failed for ${channel}`, {
          errors: outputValidation.errors,
          output: result,
        });
        return {
          success: false,
          error: 'Handler returned invalid output',
          code: 'OUTPUT_VALIDATION_ERROR',
          details: outputValidation.errors,
        };
      }

      const duration = Date.now() - startTime;
      if (duration > 1000) {
        logger.warn(`Slow IPC call: ${channel} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      logger.error(`IPC handler error for ${channel}`, error);
      return {
        success: false,
        error: error.message,
        code: 'HANDLER_ERROR',
        stack: error.stack,
      };
    }
  });

  logger.debug(`Registered IPC handler: ${channel}`);
}

/**
 * Register multiple handlers from schema
 * @param {Object} schema - Schema with handlers
 * @param {Object} handlers - Handler functions keyed by channel
 */
export function registerHandlers(schema, handlers) {
  let registered = 0;

  for (const [channel, channelSchema] of Object.entries(schema)) {
    const handler = handlers[channel];
    
    if (!handler) {
      logger.warn(`No handler provided for channel: ${channel}`);
      continue;
    }

    registerHandler(channel, channelSchema, handler);
    registered++;
  }

  logger.info(`Registered ${registered} IPC handlers`);
}

/**
 * Remove IPC handler
 * @param {string} channel - Channel name
 */
export function removeHandler(channel) {
  ipcMain.removeHandler(channel);
  logger.debug(`Removed IPC handler: ${channel}`);
}

/**
 * Remove all IPC handlers
 */
export function removeAllHandlers() {
  // Electron doesn't provide a way to list all handlers
  // Handlers will be cleaned up when app quits
  logger.debug('IPC handlers will be cleaned up on app quit');
}

/**
 * Create standard error response
 * @param {string} message - Error message
 * @param {string} [code] - Error code
 * @returns {Object} Error response
 */
export function createErrorResponse(message, code = 'ERROR') {
  return {
    success: false,
    error: message,
    code,
  };
}

/**
 * Create standard success response
 * @param {Object} data - Response data
 * @returns {Object} Success response
 */
export function createSuccessResponse(data = {}) {
  return {
    success: true,
    ...data,
  };
}
