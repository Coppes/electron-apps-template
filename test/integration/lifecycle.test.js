/**
 * Integration tests for lifecycle manager
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app } from 'electron';
import { existsSync } from 'fs';
import fs from 'fs/promises';

// Mock electron modules
vi.mock('electron', () => ({
  app: {
    getVersion: vi.fn(() => '1.0.0'),
    getPath: vi.fn((name) => `/tmp/electron-test/${name}`),
    requestSingleInstanceLock: vi.fn(() => true),
    on: vi.fn(),
    quit: vi.fn(),
  },
}));

// Mock fs
vi.mock('fs/promises', () => ({
  default: {
    writeFile: vi.fn(),
    unlink: vi.fn(),
    access: vi.fn(),
  },
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(() => false),
}));

// Mock modules
vi.mock('../../../src/main/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../../src/main/window-manager.js', () => ({
  windowManager: {
    createWindow: vi.fn(() => ({ id: 1 })),
    saveAllStates: vi.fn(),
    closeAllWindows: vi.fn(),
  },
}));

vi.mock('../../../src/main/menu.js', () => ({
  setupMenu: vi.fn(),
}));

vi.mock('../../../src/main/ipc/bridge.js', () => ({
  registerHandlers: vi.fn(),
}));

vi.mock('../../../src/main/ipc/handlers/log.js', () => ({
  registerLogHandlers: vi.fn(),
}));

vi.mock('../../../src/main/ipc/handlers/window.js', () => ({
  createWindowHandlers: vi.fn(() => ({})),
}));

vi.mock('../../../src/main/ipc/handlers/store.js', () => ({
  createStoreHandlers: vi.fn(() => ({})),
}));

vi.mock('../../../src/main/ipc/handlers/dialog.js', () => ({
  createDialogHandlers: vi.fn(() => ({})),
}));

vi.mock('../../../src/main/ipc/handlers/app.js', () => ({
  createAppHandlers: vi.fn(() => ({})),
}));

vi.mock('../../../src/main/config.js', () => ({
  config: {
    env: 'test',
    singleInstance: {
      enabled: true,
    },
  },
  loadEnvironmentOverrides: vi.fn(() => ({})),
}));

// Import after mocking
const { LifecycleManager } = await import('../../../src/main/lifecycle.js');
const { logger } = await import('../../../src/main/logger.js');
const { windowManager } = await import('../../../src/main/window-manager.js');
const { registerHandlers } = await import('../../../src/main/ipc/bridge.js');
const { setupMenu } = await import('../../../src/main/menu.js');

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
      expect(logger.info).toHaveBeenCalledWith(
        'Application startup initiated',
        expect.objectContaining({
          version: '1.0.0',
          environment: 'test',
        })
      );

      expect(registerHandlers).toHaveBeenCalled();
      expect(setupMenu).toHaveBeenCalled();
      expect(windowManager.createWindow).toHaveBeenCalledWith('main');
      
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('startup completed'),
        expect.anything()
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
      existsSync.mockReturnValueOnce(true);
      
      await lifecycle.checkCrashRecovery();

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('crash'),
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
      expect(handler).toBeInstanceOf(Function);
    });

    it('should parse and validate deep link URLs', () => {
      const url = 'electronapp://action/test?param=value';
      const parsed = lifecycle.parseDeepLink(url);

      expect(parsed).toEqual({
        protocol: 'electronapp',
        action: 'action',
        path: 'test',
        params: { param: 'value' },
      });
    });

    it('should reject invalid deep link URLs', () => {
      const url = 'http://external.com/path';
      const parsed = lifecycle.parseDeepLink(url);

      expect(parsed).toBeNull();
    });
  });

  describe('Environment Configuration', () => {
    it('should load environment overrides on startup', async () => {
      const { loadEnvironmentOverrides } = await import('../../../src/main/config.js');
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
