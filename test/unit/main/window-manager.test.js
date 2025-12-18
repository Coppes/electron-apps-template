import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WindowManager } from '../../../src/main/window-manager.js';
import { WINDOW_TYPES } from '../../../src/common/constants.js';
import { BrowserWindow, mockApp } from '../../setup/electron-mocks.js';

// Mock dependencies
vi.mock('../../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('electron-store', () => ({
  default: class MockStore {
    constructor() {
      this.data = {};
    }
    get(key, defaultValue) {
      return this.data[key] ?? defaultValue;
    }
    set(key, value) {
      this.data[key] = value;
    }
    delete(key) {
      delete this.data[key];
    }
    has(key) {
      return key in this.data;
    }
    clear() {
      this.data = {};
    }
  },
}));

vi.mock('../../../src/main/config.js', () => ({
  isDevelopment: vi.fn(() => false),
}));

describe('WindowManager', () => {
  let windowManager;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    BrowserWindow.getAllWindows.mockReturnValue([]);

    // Set default app.isPackaged
    mockApp.isPackaged = false;

    // Create fresh instance
    windowManager = new WindowManager();
  });

  describe('createWindow', () => {
    it('should create window with default type (main)', () => {
      const window = windowManager.createWindow();

      expect(window).toBeInstanceOf(BrowserWindow);
      expect(window.loadFile).toHaveBeenCalled();
    });

    it('should create window with specified type', () => {
      const window = windowManager.createWindow(WINDOW_TYPES.MAIN);

      expect(window).toBeInstanceOf(BrowserWindow);
      expect(windowManager.windows.size).toBe(1);
    });

    it('should throw error for invalid window type', () => {
      expect(() => {
        windowManager.createWindow('invalid-type');
      }).toThrow('Invalid window type');
    });

    it('should merge custom options with default config', () => {
      const customOptions = {
        width: 1000,
        height: 800,
      };

      const window = windowManager.createWindow(WINDOW_TYPES.MAIN, customOptions);

      expect(window).toBeInstanceOf(BrowserWindow);
    });

    it('should track created window', () => {
      const window = windowManager.createWindow();
      const windowId = window.id;

      expect(windowManager.windows.has(windowId)).toBe(true);
      const tracked = windowManager.windows.get(windowId);
      expect(tracked.window).toBe(window);
      expect(tracked.type).toBe(WINDOW_TYPES.MAIN);
    });

    it('should setup event handlers on created window', () => {
      const window = windowManager.createWindow();

      expect(window.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(window.on).toHaveBeenCalledWith('closed', expect.any(Function));
      expect(window.on).toHaveBeenCalledWith('focus', expect.any(Function));
      expect(window.on).toHaveBeenCalledWith('blur', expect.any(Function));
    });

    it('should load URL in development mode', async () => {
      // Create a new window manager instance with dev mode
      const { WindowManager } = await import('../../../src/main/window-manager.js');
      const { isDevelopment } = await import('../../../src/main/config.js');
      isDevelopment.mockReturnValueOnce(true);

      const devWindowManager = new WindowManager();
      const window = devWindowManager.createWindow();

      expect(window.loadURL).toHaveBeenCalledWith('http://localhost:5173');
    });

    it('should load file in production mode', async () => {
      const { WindowManager } = await import('../../../src/main/window-manager.js');
      const { isDevelopment } = await import('../../../src/main/config.js');
      isDevelopment.mockReturnValueOnce(false);

      const prodWindowManager = new WindowManager();
      const window = prodWindowManager.createWindow();

      expect(window.loadFile).toHaveBeenCalled();
    });
  });

  describe('createAuxiliaryWindow', () => {
    it('should create auxiliary window with route', () => {
      const route = '/test-route';
      // Mock createWindow to verify it's called
      const createWindowSpy = vi.spyOn(windowManager, 'createWindow');

      const window = windowManager.createAuxiliaryWindow(route);

      expect(createWindowSpy).toHaveBeenCalledWith(WINDOW_TYPES.AUXILIARY, expect.objectContaining({
        route
      }));
      expect(window).toBeInstanceOf(BrowserWindow);
    });
  });

  describe('getWindow', () => {
    it('should return window by ID', () => {
      const window = windowManager.createWindow();
      const windowId = window.id;

      const retrieved = windowManager.getWindow(windowId);

      expect(retrieved).toBe(window);
    });

    it('should return null for non-existent window ID', () => {
      const retrieved = windowManager.getWindow(99999);

      expect(retrieved).toBeNull();
    });
  });

  describe('getWindowByType', () => {
    it('should return first window of specified type', () => {
      const window = windowManager.createWindow(WINDOW_TYPES.MAIN);

      const retrieved = windowManager.getWindowByType(WINDOW_TYPES.MAIN);

      expect(retrieved).toBe(window);
    });

    it('should return null if no window of type exists', () => {
      const retrieved = windowManager.getWindowByType(WINDOW_TYPES.MAIN);

      expect(retrieved).toBeNull();
    });
  });

  describe('getAllWindows', () => {
    it('should return empty array when no windows', () => {
      const windows = windowManager.getAllWindows();

      expect(windows).toEqual([]);
    });

    it('should return all window instances', () => {
      const window1 = windowManager.createWindow(WINDOW_TYPES.MAIN);
      const window2 = windowManager.createWindow(WINDOW_TYPES.MAIN);

      const windows = windowManager.getAllWindows();

      expect(windows).toHaveLength(2);
      expect(windows[0].window).toBe(window1);
      expect(windows[1].window).toBe(window2);
      expect(windows[0].type).toBe(WINDOW_TYPES.MAIN);
      expect(windows[1].type).toBe(WINDOW_TYPES.MAIN);
    });
  });

  describe('closeWindow', () => {
    it('should close window by ID', () => {
      const window = windowManager.createWindow();
      const windowId = window.id;

      windowManager.closeWindow(windowId);

      expect(window.close).toHaveBeenCalled();
    });

    it('should not throw if window ID does not exist', () => {
      expect(() => {
        windowManager.closeWindow(99999);
      }).not.toThrow();
    });
  });

  describe('closeAllWindows', () => {
    it('should close all tracked windows', () => {
      const window1 = windowManager.createWindow();
      const window2 = windowManager.createWindow();

      windowManager.closeAllWindows();

      expect(window1.close).toHaveBeenCalled();
      expect(window2.close).toHaveBeenCalled();
    });

    it('should not throw when no windows exist', () => {
      expect(() => {
        windowManager.closeAllWindows();
      }).not.toThrow();
    });
  });

  describe('saveState', () => {
    it('should save window bounds to store', () => {
      const window = windowManager.createWindow(WINDOW_TYPES.MAIN);
      const windowId = window.id;

      window.getBounds = vi.fn(() => ({
        x: 100,
        y: 100,
        width: 800,
        height: 600,
      }));
      window.isMaximized = vi.fn(() => false);

      windowManager.saveState(windowId);

      expect(windowManager.store.get(`windowState.${WINDOW_TYPES.MAIN}`)).toBeDefined();
    });

    it('should save maximized state', () => {
      const window = windowManager.createWindow(WINDOW_TYPES.MAIN);
      const windowId = window.id;

      window.getBounds = vi.fn(() => ({ x: 0, y: 0, width: 1920, height: 1080 }));
      window.isMaximized = vi.fn(() => true);

      windowManager.saveState(windowId);

      const state = windowManager.store.get(`windowState.${WINDOW_TYPES.MAIN}`);
      expect(state.isMaximized).toBe(true);
    });
  });

  describe('restoreState', () => {
    it('should restore saved window state', () => {
      const savedState = {
        x: 100,
        y: 100,
        width: 800,
        height: 600,
        isMaximized: false,
      };

      windowManager.store.set(`windowState.${WINDOW_TYPES.MAIN}`, savedState);

      const restored = windowManager.restoreState(WINDOW_TYPES.MAIN);

      expect(restored).toEqual(savedState);
    });

    it('should return null if no saved state exists', () => {
      const restored = windowManager.restoreState(WINDOW_TYPES.MAIN);

      expect(restored).toBeNull();
    });
  });

  describe('window event handlers', () => {
    it('should save state when window closes', () => {
      const window = windowManager.createWindow();

      window.getBounds = vi.fn(() => ({ x: 0, y: 0, width: 800, height: 600 }));
      window.isMaximized = vi.fn(() => false);

      // Trigger close event
      window.emit('close');

      expect(windowManager.store.get(`windowState.${WINDOW_TYPES.MAIN}`)).toBeDefined();
    });

    it('should remove window from tracking when closed', () => {
      const window = windowManager.createWindow();
      const windowId = window.id;

      // Trigger closed event
      window.emit('closed');

      expect(windowManager.windows.has(windowId)).toBe(false);
    });
  });
});
