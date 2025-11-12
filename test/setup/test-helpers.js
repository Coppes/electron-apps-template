import { vi } from 'vitest';
import { BrowserWindow, mockWebContents } from './electron-mocks.js';

/**
 * Create a mock BrowserWindow instance for testing
 * @param {Object} overrides - Properties to override
 * @returns {BrowserWindow} Mock window instance
 */
export function createMockWindow(overrides = {}) {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
  });

  // Apply any overrides
  Object.assign(window, overrides);

  return window;
}

/**
 * Create a mock WebContents instance for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock WebContents instance
 */
export function createMockWebContents(overrides = {}) {
  return {
    ...mockWebContents,
    ...overrides,
  };
}

/**
 * Wait for an IPC call to complete
 * @param {Function} ipcHandler - The IPC handler function
 * @param {string} channel - The IPC channel name
 * @param {*} payload - The payload to send
 * @returns {Promise<*>} The result of the IPC call
 */
export async function waitForIpc(ipcHandler, channel, payload) {
  return await ipcHandler(channel, payload);
}

/**
 * Create a mock logger that doesn't output to console
 * @returns {Object} Mock logger
 */
export function mockLogger() {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };
}

/**
 * Reset all mocks to their initial state
 */
export function resetAllMocks() {
  vi.clearAllMocks();
}

/**
 * Create a mock event object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock event
 */
export function createMockEvent(overrides = {}) {
  return {
    preventDefault: vi.fn(),
    sender: createMockWebContents(),
    ...overrides,
  };
}

/**
 * Simulate a delay for testing async operations
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock file descriptor for testing file operations
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock file descriptor
 */
export function createMockFile(overrides = {}) {
  return {
    name: 'test-file.txt',
    path: '/mock/path/test-file.txt',
    size: 1024,
    type: 'text/plain',
    lastModified: Date.now(),
    ...overrides,
  };
}
