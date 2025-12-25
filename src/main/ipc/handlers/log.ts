import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from 'electron';
import { IPC_CHANNELS } from '../../../common/constants.ts';
import { logger } from '../../logger.ts';

/**
 * Maximum log message size to prevent DOS attacks (10KB)
 */
const MAX_LOG_MESSAGE_SIZE = 10 * 1024;

/**
 * Rate limiting: track log counts per window
 */
const logCounts = new Map<number | string, number>();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_LOGS_PER_WINDOW = 100;

/**
 * Reset rate limit counters periodically
 */
setInterval(() => {
  logCounts.clear();
}, RATE_LIMIT_WINDOW);

/**
 * Check if window is rate limited
 * @param {number|string} windowId - Window identifier
 * @returns {boolean} True if rate limited
 */
function isRateLimited(windowId: number | string): boolean {
  const count = logCounts.get(windowId) || 0;
  if (count >= MAX_LOGS_PER_WINDOW) {
    return true;
  }
  logCounts.set(windowId, count + 1);
  return false;
}

/**
 * Validate log message
 * @param {string} message - Log message
 * @throws {Error} If message is invalid
 */
function validateLogMessage(message: unknown): void {
  if (typeof message !== 'string') {
    throw new Error('Log message must be a string');
  }

  if (message.length > MAX_LOG_MESSAGE_SIZE) {
    throw new Error('Log message too large');
  }
}

/**
 * Sanitize metadata for logging
 * Handles circular references and functions
 * @param {Object} meta - Metadata object
 * @returns {Object} Sanitized metadata
 */
function sanitizeMetadata(meta: unknown): Record<string, unknown> {
  if (!meta || typeof meta !== 'object') {
    return {};
  }

  try {
    return JSON.parse(JSON.stringify(meta, (_key, value) => {
      if (typeof value === 'function') {
        return '[Function]';
      }
      return value;
    }));
  } catch (error) {
    return { error: 'Failed to serialize metadata' };
  }
}

interface LogPayload {
  message: string;
  meta?: Record<string, unknown>;
}

/**
 * Handle log debug message from renderer
 * @param {IpcMainInvokeEvent} event - IPC event
 * @param {LogPayload} params - Log parameters
 * @returns {Promise<Object>} Success response
 */
async function handleLogDebug(event: IpcMainInvokeEvent, { message, meta = {} }: LogPayload) {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    const windowId = window?.id || 'unknown';

    // Rate limiting check
    if (isRateLimited(windowId)) {
      logger.warn(`Rate limit exceeded for window ${windowId}`);
      return { success: false, error: 'Rate limit exceeded' };
    }

    // Validate message
    validateLogMessage(message);

    // Sanitize metadata
    const sanitizedMeta = sanitizeMetadata(meta);

    // Log with renderer tag
    logger.debug(`[Renderer:${windowId}] ${message}`, sanitizedMeta);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to handle log debug', { error: message });
    return { success: false, error: message };
  }
}

/**
 * Handle log info message from renderer
 * @param {IpcMainInvokeEvent} event - IPC event
 * @param {LogPayload} params - Log parameters
 * @returns {Promise<Object>} Success response
 */
async function handleLogInfo(event: IpcMainInvokeEvent, { message, meta = {} }: LogPayload) {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    const windowId = window?.id || 'unknown';

    // Rate limiting check
    if (isRateLimited(windowId)) {
      logger.warn(`Rate limit exceeded for window ${windowId}`);
      return { success: false, error: 'Rate limit exceeded' };
    }

    // Validate message
    validateLogMessage(message);

    // Sanitize metadata
    const sanitizedMeta = sanitizeMetadata(meta);

    // Log with renderer tag
    logger.info(`[Renderer:${windowId}] ${message}`, sanitizedMeta);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to handle log info', { error: message });
    return { success: false, error: message };
  }
}

/**
 * Handle log warn message from renderer
 * @param {IpcMainInvokeEvent} event - IPC event
 * @param {LogPayload} params - Log parameters
 * @returns {Promise<Object>} Success response
 */
async function handleLogWarn(event: IpcMainInvokeEvent, { message, meta = {} }: LogPayload) {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    const windowId = window?.id || 'unknown';

    // Rate limiting check
    if (isRateLimited(windowId)) {
      logger.warn(`Rate limit exceeded for window ${windowId}`);
      return { success: false, error: 'Rate limit exceeded' };
    }

    // Validate message
    validateLogMessage(message);

    // Sanitize metadata
    const sanitizedMeta = sanitizeMetadata(meta);

    // Log with renderer tag
    logger.warn(`[Renderer:${windowId}] ${message}`, sanitizedMeta);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to handle log warn', { error: message });
    return { success: false, error: message };
  }
}

/**
 * Handle log error message from renderer
 * @param {IpcMainInvokeEvent} event - IPC event
 * @param {LogPayload} params - Log parameters
 * @returns {Promise<Object>} Success response
 */
async function handleLogError(event: IpcMainInvokeEvent, { message, meta = {} }: LogPayload) {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    const windowId = window?.id || 'unknown';

    // Rate limiting check
    if (isRateLimited(windowId)) {
      logger.warn(`Rate limit exceeded for window ${windowId}`);
      return { success: false, error: 'Rate limit exceeded' };
    }

    // Validate message
    validateLogMessage(message);

    // Sanitize metadata
    const sanitizedMeta = sanitizeMetadata(meta);

    // Log with renderer tag
    logger.error(`[Renderer:${windowId}] ${message}`, sanitizedMeta);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to handle log error', { error: message });
    return { success: false, error: message };
  }
}

/**
 * Register all log IPC handlers
 */
export function registerLogHandlers() {
  ipcMain.handle(IPC_CHANNELS.LOG_DEBUG, handleLogDebug);
  ipcMain.handle(IPC_CHANNELS.LOG_INFO, handleLogInfo);
  ipcMain.handle(IPC_CHANNELS.LOG_WARN, handleLogWarn);
  ipcMain.handle(IPC_CHANNELS.LOG_ERROR, handleLogError);

  logger.debug('Log IPC handlers registered');
}
