import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { windowManager } from '../../src/main/window-manager.js';
import { BrowserWindow } from 'electron';

// Mock dependencies
vi.mock('electron', () => {
  const listeners = new Map();
  return {
    app: {
      on: vi.fn(),
      removeListener: vi.fn(),
      getPath: vi.fn(() => '/mock/user/data'),
      getName: vi.fn(() => 'TestApp'),
      getVersion: vi.fn(() => '1.0.0'),
    },
    screen: {
      getPrimaryDisplay: vi.fn(() => ({
        workArea: { x: 0, y: 0, width: 1920, height: 1080 }
      }))
    },
    BrowserWindow: vi.fn().mockImplementation(function () {
      // Mock unique ID for each instance
      const id = Math.floor(Math.random() * 100000) + 1;
      const instanceListeners = new Map();
      return {
        id,
        on: vi.fn((event, cb) => {
          instanceListeners.set(event, cb);
        }),
        emit: (event) => { // Helper to emit events for testing
          const cb = instanceListeners.get(event);
          if (cb) cb();
        },
        removeListener: vi.fn(),
        loadURL: vi.fn(),
        show: vi.fn(),
        close: vi.fn(),
        destroy: vi.fn(),
        isDestroyed: vi.fn(() => false),
        webContents: {
          send: vi.fn(),
          setWindowOpenHandler: vi.fn(),
          on: vi.fn(),
        },
        getBounds: vi.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
        isMaximized: vi.fn(() => false),
        isFullScreen: vi.fn(() => false),
      };
    })
  };
});

vi.mock('electron-store', () => {
  return {
    default: class {
      constructor() { this.store = {}; }
      get(key) { return this.store[key]; }
      set(key, value) { this.store[key] = value; }
    }
  };
});

vi.mock('../../src/main/logger.js');

describe('Window Lifecycle Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window manager state if needed (it's a singleton, so we might need to clear its map)
    windowManager.windows.clear();
  });

  it('should create and track a new window', () => {
    const win = windowManager.createWindow('main', { show: false });

    expect(win).toBeDefined();
    expect(BrowserWindow).toHaveBeenCalled();
    expect(windowManager.windows.has(win.id)).toBe(true);
    expect(windowManager.getWindow(win.id)).toBe(win);
  });

  it('should retrieve existing window by type', () => {
    const win1 = windowManager.createWindow('main');
    const win2 = windowManager.getWindowByType('main');

    expect(win1).toBe(win2);
  });

  it('should track multiple windows', () => {
    const win1 = windowManager.createWindow('settings');
    const win2 = windowManager.createWindow('settings');

    expect(win1).not.toBe(win2);
    expect(windowManager.getAllWindows().length).toBeGreaterThanOrEqual(2);
  });

  it('should cleanup tracking when window closes', () => {
    const win = windowManager.createWindow('main');
    // Simulate close
    windowManager.closeWindow(win.id);

    expect(win.close).toHaveBeenCalled();

    // Trigger 'closed' event to complete cleanup
    win.emit('closed');

    expect(windowManager.windows.has(win.id)).toBe(false);
  });
});
