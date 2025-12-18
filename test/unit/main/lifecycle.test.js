import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app } from 'electron';
import fs from 'fs/promises';
import { lifecycleManager } from '../../../src/main/lifecycle.js';
import { windowManager } from '../../../src/main/window-manager.js';
import { logger } from '../../../src/main/logger.js';
import { splashManager } from '../../../src/main/splash.js';
import connectivityManager from '../../../src/main/data/connectivity-manager.js';
import syncQueue from '../../../src/main/data/sync-queue.js';
import { trayManager } from '../../../src/main/tray.js';
import fileWatcher from '../../../src/main/data/file-watcher.js';
import { notificationManager } from '../../../src/main/notifications.js';

const fsMocks = vi.hoisted(() => ({
  access: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn()
}));

vi.mock('fs/promises', () => ({
  default: fsMocks,
  ...fsMocks
}));

// Mock dependencies
vi.mock('electron', () => {
  return {
    app: {
      getVersion: vi.fn(() => '1.0.0'),
      getPath: vi.fn(() => '/mock/user/data'),
      requestSingleInstanceLock: vi.fn(),
      on: vi.fn(),
      setAsDefaultProtocolClient: vi.fn(),
      isDefaultProtocolClient: vi.fn(),
      quit: vi.fn()
    },
    BrowserWindow: {
      fromWebContents: vi.fn()
    }
  };
});
vi.mock('electron-log', () => ({
  default: {
    transports: {
      file: {
        resolvePath: vi.fn(),
        level: 'info',
        getFile: vi.fn(() => ({ path: '/mock/path/main.log' }))
      },
      console: {
        level: 'debug'
      }
    },
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    create: vi.fn().mockReturnThis()
  }
}));

vi.mock('electron-store', () => {
  return {
    default: class {
      constructor() { }
      get() { }
      set() { }
      delete() { }
      has() { }
      clear() { }
    }
  };
});
vi.mock('../../../src/main/window-manager.js', () => ({
  windowManager: {
    createWindow: vi.fn(),
    getWindowByType: vi.fn(),
    focusWindow: vi.fn(),
    saveAllStates: vi.fn(),
    closeAllWindows: vi.fn()
  }
}));
vi.mock('../../../src/main/notifications.js', () => ({
  notificationManager: {
    showNotification: vi.fn().mockResolvedValue()
  }
}));
vi.mock('../../../src/main/logger.js');
vi.mock('../../../src/main/splash.js');
vi.mock('../../../src/main/menu.js');
vi.mock('../../../src/main/ipc/bridge.js');
vi.mock('../../../src/main/ipc/handlers/log.js');
vi.mock('../../../src/main/data/connectivity-manager.js');
vi.mock('../../../src/main/data/sync-queue.js');
vi.mock('../../../src/main/tray.js');
vi.mock('../../../src/main/shortcuts.js');
vi.mock('../../../src/main/data/file-watcher.js');
// vi.mock('../../../src/main/notifications.js'); // Duplicate
vi.mock('../../../src/main/config.js', () => ({
  config: {
    env: 'production',
    singleInstance: { enabled: true },
    osIntegration: {
      tray: { enabled: true },
      shortcuts: { enabled: true, defaults: {} }
    },
    deepLinking: { enabled: true }
  },
  loadEnvironmentOverrides: vi.fn(() => ({}))
}));

describe('LifecycleManager', () => {
  const mockMainWindow = {
    id: 1,
    webContents: {
      isLoading: vi.fn(() => false),
      once: vi.fn(),
      send: vi.fn()
    },
    show: vi.fn(),
    isDestroyed: vi.fn(() => false),
    isMinimized: vi.fn(() => false),
    restore: vi.fn(),
    window: { // Used in some parts of the code
      isMinimized: vi.fn(() => false),
      restore: vi.fn()
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    app.getVersion.mockReturnValue('1.0.0');
    app.getPath.mockReturnValue('/mock/user/data');
    app.requestSingleInstanceLock.mockReturnValue(true);

    windowManager.createWindow.mockReturnValue(mockMainWindow);
    windowManager.getWindowByType.mockReturnValue(mockMainWindow);

    fsMocks.access.mockRejectedValue({ code: 'ENOENT' }); // File doesn't exist by default
    fsMocks.unlink.mockResolvedValue(undefined);
    fsMocks.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('startup', () => {
    it('should initialize application components in order', async () => {
      await lifecycleManager.startup();

      // Verify splash screen
      expect(splashManager.show).toHaveBeenCalled();

      // Verify IPC registration (indirectly via log handlers and others)
      expect(logger.info).toHaveBeenCalledWith('IPC handlers registered');

      // Verify data services
      expect(connectivityManager.initialize).toHaveBeenCalled();
      expect(syncQueue.initialize).toHaveBeenCalled();

      // Verify main window creation
      expect(windowManager.createWindow).toHaveBeenCalledWith('main', expect.objectContaining({ show: false }));

      // Verify window showing
      expect(mockMainWindow.show).toHaveBeenCalled();
      expect(splashManager.fadeOut).toHaveBeenCalled();

      // Verify crash marker removal
      expect(fsMocks.unlink).toHaveBeenCalledWith(expect.stringContaining('.crash-marker'));
    });

    it('should handle startup errors', async () => {
      const error = new Error('Startup failed');
      connectivityManager.initialize.mockRejectedValue(error);

      await expect(lifecycleManager.startup()).rejects.toThrow('Startup failed');
      expect(logger.error).toHaveBeenCalledWith('Application startup failed', error);
    });
  });

  describe('shutdown', () => {
    beforeEach(() => {
      lifecycleManager.isShuttingDown = false;
    });

    it('should perform graceful shutdown', async () => {
      await lifecycleManager.shutdown();

      // Verify cleanup
      expect(trayManager.destroy).toHaveBeenCalled();
      expect(connectivityManager.cleanup).toHaveBeenCalled();
      expect(fileWatcher.cleanup).toHaveBeenCalled();

      // Verify window management
      expect(windowManager.saveAllStates).toHaveBeenCalled();
      expect(windowManager.closeAllWindows).toHaveBeenCalled();
    });

    it('should prevent multiple shutdown calls', async () => {
      lifecycleManager.isShuttingDown = true;
      await lifecycleManager.shutdown();

      expect(logger.warn).toHaveBeenCalledWith('Shutdown already in progress');
      expect(windowManager.closeAllWindows).not.toHaveBeenCalled();
    });
  });

  describe('single instance lock', () => {
    it('should return true if lock acquired', () => {
      app.requestSingleInstanceLock.mockReturnValue(true);
      const result = lifecycleManager.setupSingleInstance();

      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Single instance lock acquired');
    });

    it('should return false if lock denied', () => {
      app.requestSingleInstanceLock.mockReturnValue(false);
      const result = lifecycleManager.setupSingleInstance();

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('Another instance is already running, exiting');
    });

    it('should handle second-instance event', () => {
      lifecycleManager.setupSingleInstance();

      // Simulate second-instance event
      const secondInstanceHandler = app.on.mock.calls.find(call => call[0] === 'second-instance')[1];
      secondInstanceHandler({}, ['app', 'file.txt'], '/');

      expect(windowManager.getWindowByType).toHaveBeenCalledWith('main');
      expect(windowManager.focusWindow).toHaveBeenCalledWith(1);
    });
  });

  describe('crash recovery', () => {
    it('should create crash marker on startup', async () => {
      await lifecycleManager.createCrashMarker();

      expect(fsMocks.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.crash-marker'),
        expect.any(String)
      );
    });

    it('should detect previous crash if marker exists', async () => {
      fsMocks.access.mockResolvedValue(undefined); // File exists
      fsMocks.readFile.mockResolvedValue(JSON.stringify({ timestamp: '2023-01-01' }));

      await lifecycleManager.checkCrashRecovery();

      expect(logger.warn).toHaveBeenCalledWith('Previous session crashed', expect.any(Object));
      expect(fsMocks.unlink).toHaveBeenCalled();

      // Verify notification was shown
      expect(notificationManager.showNotification).toHaveBeenCalledWith(expect.objectContaining({
        title: 'App Recovered',
        urgency: 'critical'
      }));
    });
  });

  describe('deep linking', () => {
    it('should register protocol client', () => {
      app.isDefaultProtocolClient.mockReturnValue(false);

      lifecycleManager.setupDeepLinking();

      expect(app.setAsDefaultProtocolClient).toHaveBeenCalledWith('electronapp');
    });
  });
});
