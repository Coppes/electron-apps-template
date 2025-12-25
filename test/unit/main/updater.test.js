
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserWindow } from 'electron';
import { updater } from '../../../src/main/updater.ts';
import { notificationManager } from '../../../src/main/notifications.ts';
import { logger } from '../../../src/main/logger.ts';
import { IPC_CHANNELS } from '../../../src/common/constants.ts';

// Using global electron mock

vi.mock('electron-store', () => {
  return {
    default: class {
      constructor() { }
      get() { }
      set() { }
    }
  };
});

vi.mock('../../../src/main/logger.ts', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    getLogInstance: vi.fn(() => ({}))
  }
}));
vi.mock('../../../src/main/notifications.ts', () => ({
  notificationManager: {
    showNotification: vi.fn().mockResolvedValue()
  }
}));

vi.mock('../../../src/main/config.ts', () => ({
  config: {
    updates: {
      enabled: true,
      autoDownload: false,
      autoInstallOnAppQuit: true
    }
  }
}));

// Mock electron-updater behavior
const mockAutoUpdater = {
  on: vi.fn(),
  checkForUpdates: vi.fn(),
  downloadUpdate: vi.fn(),
  quitAndInstall: vi.fn(),
  autoDownload: false,
  autoInstallOnAppQuit: true,
  logger: null
};

// We need to bypass the dynamic import for testing
vi.mock('electron-updater', () => ({
  autoUpdater: mockAutoUpdater
}));

describe('Updater', () => {
  const mockWindow = {
    webContents: {
      send: vi.fn()
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    BrowserWindow.getAllWindows.mockReturnValue([mockWindow]);

    // Manually inject the mocked autoUpdater since the dynamic import handles it in source
    updater.autoUpdater = mockAutoUpdater;
    updater.setupEventHandlers(); // Re-bind handlers
  });

  describe('initialize', () => {
    it('should configure autoUpdater', async () => {
      await updater.initialize();

      expect(mockAutoUpdater.autoDownload).toBe(false);
      expect(mockAutoUpdater.autoInstallOnAppQuit).toBe(true);
      expect(mockAutoUpdater.on).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Auto-updater initialized', expect.any(Object));
    });
  });

  describe('checkForUpdates', () => {
    it('should trigger update check', async () => {
      mockAutoUpdater.checkForUpdates.mockResolvedValue({ updateInfo: { version: '1.0.1' } });

      const result = await updater.checkForUpdates();

      expect(mockAutoUpdater.checkForUpdates).toHaveBeenCalled();
      expect(result.updateInfo.version).toBe('1.0.1');
    });

    it('should handle errors', async () => {
      const error = new Error('Network error');
      mockAutoUpdater.checkForUpdates.mockRejectedValue(error);

      await expect(updater.checkForUpdates()).rejects.toThrow('Network error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('events', () => {
    // Helper to trigger an event callback registered via .on()
    const triggerEvent = (eventName, ...args) => {
      const calls = mockAutoUpdater.on.mock.calls;
      const call = calls.find(c => c[0] === eventName);
      if (call) {
        call[1](...args);
      }
    };

    it('should handle update-available', () => {
      const info = { version: '2.0.0', releaseDate: '2025-01-01' };

      triggerEvent('update-available', info);

      expect(updater.updateAvailable).toBe(true);
      expect(notificationManager.showNotification).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Update Available',
        body: expect.stringContaining('2.0.0')
      }));
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.UPDATE_AVAILABLE, expect.objectContaining({
        version: '2.0.0'
      }));
    });

    it('should handle download-progress', () => {
      const progress = { percent: 50, transferred: 100, total: 200, bytesPerSecond: 1000 };

      triggerEvent('download-progress', progress);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.UPDATE_PROGRESS, expect.objectContaining({
        percent: 50
      }));
    });

    it('should handle update-downloaded', () => {
      const info = { version: '2.0.0', releaseDate: '2025-01-01' };

      triggerEvent('update-downloaded', info);

      expect(notificationManager.showNotification).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Update Ready'
      }));
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.UPDATE_DOWNLOADED, expect.objectContaining({
        version: '2.0.0'
      }));
    });

    it('should handle error', () => {
      const error = new Error('Update failed');

      triggerEvent('error', error);

      expect(logger.error).toHaveBeenCalled();
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.UPDATE_ERROR, expect.objectContaining({
        message: 'Update failed'
      }));
    });
  });

  describe('downloadUpdate', () => {
    it('should start download if available', async () => {
      updater.updateAvailable = true;

      await updater.downloadUpdate();

      expect(mockAutoUpdater.downloadUpdate).toHaveBeenCalled();
    });

    it('should not download if not available', async () => {
      updater.updateAvailable = false;

      await updater.downloadUpdate();

      expect(mockAutoUpdater.downloadUpdate).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('quitAndInstall', () => {
    it('should call autoUpdater quitAndInstall', () => {
      updater.quitAndInstall();

      expect(mockAutoUpdater.quitAndInstall).toHaveBeenCalledWith(false, true);
    });
  });
});
