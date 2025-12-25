import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app } from 'electron';
import { createAppHandlers } from '../../../../../src/main/ipc/handlers/app.ts';
import { IPC_CHANNELS } from '../../../../../src/common/constants.ts';

// Using global electron mock

// Mock dependencies
vi.mock('../../../../../src/main/logger.ts', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  }
}));

vi.mock('../../../../../src/main/updater.ts', () => ({
  updater: {
    checkForUpdates: vi.fn(),
    quitAndInstall: vi.fn()
  }
}));

vi.mock('../../../../../src/main/recent-docs.ts', () => ({
  addRecentDocument: vi.fn(),
  clearRecentDocuments: vi.fn()
}));

// Mock process.versions
const originalVersions = process.versions;

describe('App IPC Handlers', () => {
  let handlers;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = createAppHandlers();

    // Mock process versions
    Object.defineProperty(process, 'versions', {
      value: {
        electron: '28.0.0',
        chrome: '120.0.0',
        node: '18.0.0',
        v8: '12.0.0'
      },
      writable: true
    });
  });

  afterEach(() => {
    // Restore process.versions
    Object.defineProperty(process, 'versions', {
      value: originalVersions,
      writable: true
    });
  });

  describe('GET_APP_VERSION', () => {
    it('should return app and runtime versions', async () => {
      app.getVersion.mockReturnValue('1.0.0');
      const handler = handlers[IPC_CHANNELS.APP_GET_VERSION];

      const result = await handler();

      expect(result).toEqual({
        electron: '28.0.0',
        chrome: '120.0.0',
        node: '18.0.0',
        v8: '12.0.0',
        app: '1.0.0'
      });
    });
  });

  describe('GET_APP_PATH', () => {
    it('should return requested path', async () => {
      app.getPath.mockReturnValue('/mock/path');
      const handler = handlers[IPC_CHANNELS.APP_GET_PATH];

      const result = await handler({}, { name: 'userData' });

      expect(app.getPath).toHaveBeenCalledWith('userData');
      expect(result).toEqual({ path: '/mock/path' });
    });

    it('should handle errors', async () => {
      app.getPath.mockImplementation(() => {
        throw new Error('Path error');
      });
      const handler = handlers[IPC_CHANNELS.APP_GET_PATH];

      const result = await handler({}, { name: 'userData' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Path error');
    });
  });

  describe('QUIT_APP', () => {
    it('should quit application', async () => {
      const handler = handlers[IPC_CHANNELS.APP_QUIT];

      const result = await handler();

      expect(app.quit).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('RELAUNCH_APP', () => {
    it('should relaunch application', async () => {
      const handler = handlers[IPC_CHANNELS.APP_RELAUNCH];

      const result = await handler();

      expect(app.relaunch).toHaveBeenCalled();
      expect(app.quit).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('GET_PLATFORM', () => {
    it('should return platform info', async () => {
      const handler = handlers[IPC_CHANNELS.SYSTEM_GET_PLATFORM];

      const result = await handler();

      expect(result).toEqual({
        platform: process.platform,
        arch: process.arch
      });
    });
  });

  describe('IS_PACKAGED', () => {
    it('should return package status', async () => {
      const handler = handlers['app:is-packaged'];

      const result = await handler();

      expect(result).toEqual({ isPackaged: false }); // global mock default
    });
  });
});
