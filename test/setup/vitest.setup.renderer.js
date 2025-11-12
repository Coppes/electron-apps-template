import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { mockElectronAPI } from './electron-mocks.js';

// Mock window.electronAPI for renderer tests
global.window.electronAPI = mockElectronAPI;

// Global test utilities
global.testHelpers = {
  // Wait for async operations
  waitFor: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
