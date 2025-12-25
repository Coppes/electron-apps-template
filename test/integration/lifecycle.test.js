/**
 * Integration tests for lifecycle manager
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app } from 'electron';
import { existsSync } from 'fs';
import fs from 'fs/promises';

// Mock electron modules
// Using global mock from setup/electron-mocks.js

// Mock fs
vi.mock('fs/promises', () => ({
  default: {
    writeFile: vi.fn(),
    unlink: vi.fn(),
    access: vi.fn(),
    readFile: vi.fn(),
  },
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(() => false),
}));

// Mock modules - using .ts extensions to match source imports
vi.mock('../../src/main/logger.ts', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../src/main/window-manager.ts', () => ({
  windowManager: {
    createWindow: vi.fn(() => ({
      id: 1,
      window: {
        webContents: { send: vi.fn() },
        show: vi.fn(),
        hide: vi.fn(),
        isVisible: vi.fn(() => true),
      },
      webContents: {
        isLoading: vi.fn(() => false),
        once: vi.fn(),
        send: vi.fn(),
      },
      show: vi.fn(),
    })),
    saveAllStates: vi.fn(),
    closeAllWindows: vi.fn(),
    getWindowByType: vi.fn(() => ({
      id: 1,
      window: {
        isVisible: vi.fn(() => true),
        hide: vi.fn(),
        focus: vi.fn(),
        webContents: { send: vi.fn() },
      },
      webContents: { send: vi.fn() },
    })),
    focusWindow: vi.fn(),
  },
}));

vi.mock('../../src/main/menu.ts', () => ({
  setupMenu: vi.fn(),
}));

vi.mock('../../src/main/ipc/bridge.ts', () => ({
  registerHandlers: vi.fn(),
}));

vi.mock('../../src/main/ipc/handlers/log.ts', () => ({
  registerLogHandlers: vi.fn(),
}));

vi.mock('../../src/main/ipc/handlers/window.ts', () => ({
  createWindowHandlers: vi.fn(() => ({})),
}));

vi.mock('../../src/main/ipc/handlers/store.ts', () => ({
  createStoreHandlers: vi.fn(() => ({})),
}));

vi.mock('../../src/main/ipc/handlers/dialog.ts', () => ({
  createDialogHandlers: vi.fn(() => ({})),
}));

vi.mock('../../src/main/ipc/handlers/app.ts', () => ({
  createAppHandlers: vi.fn(() => ({})),
}));

vi.mock('../../src/main/config.ts', () => ({
  config: {
    env: 'test',
    singleInstance: {
      enabled: true,
    },
    deepLinking: {
      enabled: true,
    },
    osIntegration: {
      tray: { enabled: true },
      shortcuts: { enabled: true },
    },
  },
  loadEnvironmentOverrides: vi.fn(() => ({})),
}));

vi.mock('electron-store', () => {
  return {
    default: class Store {
      constructor() {
        this.store = {};
      }
      get(key, defaultValue) { return this.store[key] ?? defaultValue; }
      set(key, val) { this.store[key] = val; }
      delete(key) { delete this.store[key]; }
      clear() { this.store = {}; }
    }
  };
});

vi.mock('../../src/main/splash.ts', () => ({
  splashManager: {
    show: vi.fn(),
    fadeOut: vi.fn(),
  },
}));

// Mock other dependencies
vi.mock('../../src/main/shortcuts.ts', () => ({
  shortcutManager: { cleanup: vi.fn(), register: vi.fn() }
}));
vi.mock('../../src/main/tray.ts', () => ({
  trayManager: { destroy: vi.fn(), createTray: vi.fn() }
}));
vi.mock('../../src/main/data/connectivity-manager.ts', () => ({
  default: { initialize: vi.fn(), cleanup: vi.fn() }
}));
vi.mock('../../src/main/data/sync-queue.ts', () => ({
  default: { initialize: vi.fn() }
}));
vi.mock('../../src/main/notifications.ts', () => ({
  notificationManager: { showNotification: vi.fn() }
}));

// Mock IPC handlers
const mockHandlers = {};
vi.mock('../../src/main/ipc/handlers/secure-store.ts', () => ({ secureStoreHandlers: mockHandlers }));
vi.mock('../../src/main/ipc/handlers/files.ts', () => ({ fileHandlers: mockHandlers }));
vi.mock('../../src/main/ipc/handlers/data.ts', () => ({ dataHandlers: mockHandlers }));
vi.mock('../../src/main/ipc/handlers/tray.ts', () => ({ trayHandlers: mockHandlers }));
vi.mock('../../src/main/ipc/handlers/shortcuts.ts', () => ({ shortcutHandlers: mockHandlers }));
vi.mock('../../src/main/ipc/handlers/notifications.ts', () => ({ notificationHandlers: mockHandlers }));
vi.mock('../../src/main/ipc/handlers/i18n.ts', () => ({ i18nHandlers: mockHandlers }));

// Import after mocking - using .ts
const { LifecycleManager } = await import('../../src/main/lifecycle.ts');
const { logger } = await import('../../src/main/logger.ts');
const { windowManager } = await import('../../src/main/window-manager.ts');
const { registerHandlers } = await import('../../src/main/ipc/bridge.ts');
const { setupMenu } = await import('../../src/main/menu.ts');
const { splashManager } = await import('../../src/main/splash.ts');

describe('Lifecycle Manager Integration', () => {
  let lifecycle;

  beforeEach(() => {
    vi.clearAllMocks();
    lifecycle = new LifecycleManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Startup Sequence', () => {
    it('should complete startup in correct order', async () => {
      await lifecycle.startup();

      // Verify initialization order
      expect(splashManager.show).toHaveBeenCalled();

      expect(logger.info).toHaveBeenCalledWith(
        'Application startup initiated',
        expect.objectContaining({
          version: '1.0.0',
          environment: 'test',
        })
      );

      expect(registerHandlers).toHaveBeenCalled();
      expect(setupMenu).toHaveBeenCalled();
      expect(windowManager.createWindow).toHaveBeenCalledWith('main', { show: false });
      expect(splashManager.fadeOut).toHaveBeenCalled();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('startup completed')
      );
    });

    it('should measure startup time', async () => {
      await lifecycle.startup();

      const startupLog = logger.info.mock.calls.find(
        call => call[0]?.includes('startup completed')
      );

      expect(startupLog).toBeDefined();
      expect(startupLog[0]).toMatch(/\d+ms/);
    });

    it('should respect minimum splash display time', async () => {
      vi.useFakeTimers();
      const startupPromise = lifecycle.startup();

      // Fast-forward time
      await vi.advanceTimersByTimeAsync(1600);
      await startupPromise;

      expect(splashManager.fadeOut).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should handle startup errors gracefully', async () => {
      windowManager.createWindow.mockImplementationOnce(() => {
        throw new Error('Window creation failed');
      });

      await expect(lifecycle.startup()).rejects.toThrow('Window creation failed');

      expect(logger.error).toHaveBeenCalledWith(
        'Application startup failed',
        expect.any(Error)
      );
    });

    it('should create and remove crash marker', async () => {
      await lifecycle.startup();

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.crash-marker'),
        expect.any(String)
      );

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('.crash-marker')
      );
    });
  });

  describe('Shutdown Sequence', () => {
    it('should complete shutdown gracefully', async () => {
      await lifecycle.shutdown();

      expect(windowManager.saveAllStates).toHaveBeenCalled();
      expect(windowManager.closeAllWindows).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Application shutdown completed gracefully'
      );
    });

    it('should prevent multiple simultaneous shutdowns', async () => {
      const shutdown1 = lifecycle.shutdown();
      const shutdown2 = lifecycle.shutdown();

      await Promise.all([shutdown1, shutdown2]);

      expect(logger.warn).toHaveBeenCalledWith('Shutdown already in progress');
    });

    it('should handle shutdown errors without crashing', async () => {
      windowManager.saveAllStates.mockImplementationOnce(() => {
        throw new Error('Save failed');
      });

      await lifecycle.shutdown();

      expect(logger.error).toHaveBeenCalledWith(
        'Error during shutdown',
        expect.any(Error)
      );
    });

    it('should flush logs during shutdown', async () => {
      const flushSpy = vi.spyOn(lifecycle, 'flushLogs');

      await lifecycle.shutdown();

      expect(flushSpy).toHaveBeenCalled();
    });
  });

  describe('Single Instance Lock', () => {
    it('should request single instance lock when enabled', () => {
      const result = lifecycle.setupSingleInstance();

      expect(app.requestSingleInstanceLock).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if lock not acquired', () => {
      app.requestSingleInstanceLock.mockReturnValueOnce(false);

      const result = lifecycle.setupSingleInstance();

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        'Another instance is already running, exiting'
      );
    });

    it('should register second-instance handler', () => {
      lifecycle.setupSingleInstance();

      expect(app.on).toHaveBeenCalledWith('second-instance', expect.any(Function));
    });
  });

  describe('Crash Recovery', () => {
    it('should detect crash marker on startup', async () => {
      fs.access.mockResolvedValueOnce();
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ timestamp: '2023-01-01' }));

      await lifecycle.checkCrashRecovery();

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Previous session crashed'),
        expect.anything()
      );
    });

    it('should remove crash marker after successful startup', async () => {
      await lifecycle.startup();

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('.crash-marker')
      );
    });

    it('should handle missing crash marker gracefully', async () => {
      fs.unlink.mockRejectedValueOnce({ code: 'ENOENT' });

      await expect(lifecycle.removeCrashMarker()).resolves.not.toThrow();
    });
  });

  describe('IPC Registration', () => {
    it('should register all IPC handler groups', async () => {
      await lifecycle.registerIPC();

      expect(registerHandlers).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      );

      const handlers = registerHandlers.mock.calls[0][1];
      expect(handlers).toBeInstanceOf(Object);
    });

    it('should log successful IPC registration', async () => {
      await lifecycle.registerIPC();

      expect(logger.info).toHaveBeenCalledWith('IPC handlers registered');
    });
  });

  describe('Deep Link Handling', () => {
    it('should register open-url handler on macOS', () => {
      const handler = lifecycle.setupDeepLinking();

      expect(app.on).toHaveBeenCalledWith('open-url', expect.any(Function));
    });

    // parseDeepLink tests removed as method does not exist in implementation
  });

  describe('Environment Configuration', () => {
    it('should load environment overrides on startup', async () => {
      const { loadEnvironmentOverrides } = await import('../../src/main/config.ts');
      loadEnvironmentOverrides.mockReturnValueOnce({ debug: true });

      await lifecycle.startup();

      expect(loadEnvironmentOverrides).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Environment overrides applied',
        { debug: true }
      );
    });
  });
});
