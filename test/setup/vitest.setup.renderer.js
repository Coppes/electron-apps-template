import '@testing-library/jest-dom';
import { vi, afterEach, beforeEach } from 'vitest';
import { mockElectronAPI } from './electron-mocks.js';

// Mock window.electronAPI for renderer tests
if (typeof window !== 'undefined') {
  window.electronAPI = mockElectronAPI;
}
global.window.electronAPI = mockElectronAPI;

// Mock react-i18next
// Mock react-i18next
const mockI18n = {
  changeLanguage: vi.fn(),
  language: 'en',
  on: vi.fn(),
  off: vi.fn(),
};

// Stable mock object to prevent infinite re-renders in effects that depend on { t }
const mockUseTranslationValues = {
  t: (key) => key,
  i18n: mockI18n,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => mockUseTranslationValues, // Return the SAME object
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

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

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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
