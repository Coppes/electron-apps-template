import { vi, afterEach } from 'vitest';
import { mockElectron } from './electron-mocks.js';

// Mock Electron modules for main process tests
vi.mock('electron', () => mockElectron);

// Global test utilities
global.testHelpers = {
  // Mock logger to prevent log spam
  mockLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
  
  // Wait for async operations
  waitFor: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
