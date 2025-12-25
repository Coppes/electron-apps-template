import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserWindow } from 'electron';
import { logger } from '../../../../../src/main/logger.ts';
import { IPC_CHANNELS } from '../../../../../src/common/constants.ts';

// Mock electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
  },
  app: {
    getPath: vi.fn(() => '/logs'),
    getName: vi.fn(() => 'Test App'),
    getVersion: vi.fn(() => '1.0.0')
  }
}));

// Mock logger
vi.mock('../../../../../src/main/logger.ts', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { registerLogHandlers } from '../../../../../src/main/ipc/handlers/log.ts';

describe('Log IPC Handlers', () => {
  let handlers = {};

  beforeEach(async () => {
    vi.clearAllMocks();

    const electron = await import('electron');
    electron.ipcMain.handle.mockImplementation((channel, handler) => {
      handlers[channel] = handler;
    });

    registerLogHandlers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const invokeHandler = async (channel, message, meta = {}, senderId = 1) => {
    const handler = handlers[channel];
    if (!handler) throw new Error(`No handler for ${channel}`);

    const event = {
      sender: { id: senderId }
    };

    // Mock BrowserWindow lookup
    BrowserWindow.fromWebContents.mockReturnValue({ id: senderId });

    return handler(event, { message, meta });
  };

  it('should register handlers for all log levels', async () => {
    const electron = await import('electron');
    expect(electron.ipcMain.handle).toHaveBeenCalledWith(IPC_CHANNELS.LOG_DEBUG, expect.any(Function));
    expect(electron.ipcMain.handle).toHaveBeenCalledWith(IPC_CHANNELS.LOG_INFO, expect.any(Function));
    expect(electron.ipcMain.handle).toHaveBeenCalledWith(IPC_CHANNELS.LOG_WARN, expect.any(Function));
    expect(electron.ipcMain.handle).toHaveBeenCalledWith(IPC_CHANNELS.LOG_ERROR, expect.any(Function));
  });

  describe('handleLogInfo', () => {
    it('should log info message with renderer tag', async () => {
      await invokeHandler(IPC_CHANNELS.LOG_INFO, 'Test message', { key: 'value' }, 10);

      expect(logger.info).toHaveBeenCalledWith(
        '[Renderer:10] Test message',
        { key: 'value' }
      );
    });

    it('should sanitize metadata removing functions', async () => {
      const meta = {
        fn: () => { },
        data: 'valid',
      };

      await invokeHandler(IPC_CHANNELS.LOG_INFO, 'Test', meta, 11);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Test'),
        { fn: '[Function]', data: 'valid' }
      );
    });

    it('should validate message type', async () => {
      const result = await invokeHandler(IPC_CHANNELS.LOG_INFO, 123, {}, 12); // Invalid type

      expect(result.success).toBe(false);
      expect(result.error).toBe('Log message must be a string');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should validate message length', async () => {
      const longMessage = 'a'.repeat(10 * 1024 + 1); // > 10KB
      const result = await invokeHandler(IPC_CHANNELS.LOG_INFO, longMessage, {}, 13);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Log message too large');
    });
  });

  describe('Rate Limiting', () => {
    it('should limit logs per window', async () => {
      // Use unique window ID to avoid previous tests affecting this
      const winId = 20;

      // Send 100 logs (allowed)
      for (let i = 0; i < 100; i++) {
        await invokeHandler(IPC_CHANNELS.LOG_INFO, `msg ${i}`, {}, winId);
      }

      // Send 101st log (blocked)
      const result = await invokeHandler(IPC_CHANNELS.LOG_INFO, 'msg 101', {}, winId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded');
    });

    it('should track limits separately per window', async () => {
      const winA = 30;
      const winB = 31;

      // Window A: 100 logs (saturate)
      for (let i = 0; i < 100; i++) {
        await invokeHandler(IPC_CHANNELS.LOG_INFO, 'msg', {}, winA);
      }

      // Window B: Should still be allowed
      const result = await invokeHandler(IPC_CHANNELS.LOG_INFO, 'msg', {}, winB);
      expect(result.success).toBe(true);
    });
  });
});
