
import { test, expect, vi, describe, beforeEach } from 'vitest';
import { WindowManager } from '../../../src/main/window-manager.js';
import { BrowserWindow } from 'electron';

// Mock electron
vi.mock('electron', () => {
  return {
    app: {
      isPackaged: false,
      getPath: vi.fn(),
      getName: vi.fn(() => 'Electron App'),
      getVersion: vi.fn(() => '1.0.0'),
    },
    screen: {
      getAllDisplays: vi.fn(() => [{ bounds: { x: 0, y: 0, width: 1920, height: 1080 } }]),
    },
    BrowserWindow: vi.fn(function () {
      return {
        id: 1,
        on: vi.fn(),
        loadURL: vi.fn(),
        loadFile: vi.fn(),
        maximize: vi.fn(),
        isMaximized: vi.fn(),
        getBounds: vi.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
        isDestroyed: vi.fn(() => false),
        webContents: {
          on: vi.fn(),
          replaceMisspelling: vi.fn(),
        },
      };
    }),
  };
});

// Mock electron-store
vi.mock('electron-store', () => {
  return {
    default: class Store {
      constructor() {
        this.store = {};
      }
      get(key) { return this.store[key]; }
      set(key, val) { this.store[key] = val; }
    }
  };
});

// Mock logger
vi.mock('../../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('WindowManager Security', () => {
  let windowManager;

  beforeEach(() => {
    vi.clearAllMocks();
    windowManager = new WindowManager();
  });

  test('should have sandbox enabled in webPreferences', () => {
    windowManager.createWindow('main');

    // Check BrowserWindow constructor calls
    const calls = BrowserWindow.mock.calls;
    expect(calls.length).toBeGreaterThan(0);

    const options = calls[0][0];
    // This expectation should FAIL if sandbox is false or undefined
    expect(options.webPreferences.sandbox).toBe(true);
  });
});
