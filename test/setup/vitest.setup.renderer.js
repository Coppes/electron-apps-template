import '@testing-library/jest-dom';
import { vi, afterEach, beforeEach } from 'vitest';
import { mockElectronAPI } from './electron-mocks.js';

// Mock window.electronAPI for renderer tests
if (typeof window !== 'undefined') {
  window.electronAPI = mockElectronAPI;
}
global.window.electronAPI = mockElectronAPI;

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
