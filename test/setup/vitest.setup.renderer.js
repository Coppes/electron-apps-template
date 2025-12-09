import '@testing-library/jest-dom';
import { vi, afterEach, beforeEach } from 'vitest';
import { mockElectronAPI } from './electron-mocks.js';

// Mock window.electronAPI for renderer tests
if (typeof window !== 'undefined') {
  window.electronAPI = mockElectronAPI;
}
global.window.electronAPI = mockElectronAPI;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
};
window.ResizeObserver = global.ResizeObserver;

// Mock PointerEvent
global.PointerEvent = class PointerEvent extends Event {
  constructor(type, props) {
    super(type, props);
    Object.assign(this, props);
  }
};
window.PointerEvent = global.PointerEvent;

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

// Restore mock before each test
beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.electronAPI = mockElectronAPI;
  }
  global.window.electronAPI = mockElectronAPI;
});

// Global test utilities
global.testHelpers = {
  // Wait for async operations
  waitFor: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
