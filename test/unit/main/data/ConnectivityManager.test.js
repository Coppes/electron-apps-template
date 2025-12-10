
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserWindow, net } from 'electron';
import connectivityManager from '../../../../src/main/data/connectivity-manager.js';
import { IPC_CHANNELS } from '../../../../src/common/constants.js';

// Mock Electron
vi.mock('electron', () => {
  return {
    app: {
      getVersion: () => '1.0.0',
      getPath: () => '/mock/path'
    },
    net: {
      request: vi.fn()
    },
    BrowserWindow: {
      getAllWindows: vi.fn()
    }
  };
});

// Mock Logger
vi.mock('../../../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('ConnectivityManager', () => {
  let mockRequest;
  let mockRequestEvents;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset manager state
    connectivityManager.isOnline = true;
    connectivityManager.stopPolling();
    connectivityManager.listeners.clear();

    // Setup network mock
    mockRequestEvents = {};
    mockRequest = {
      on: vi.fn((event, handler) => {
        mockRequestEvents[event] = handler;
      }),
      end: vi.fn(),
      abort: vi.fn()
    };
    net.request.mockReturnValue(mockRequest);
  });

  afterEach(() => {
    connectivityManager.cleanup();
  });

  it('should initialize and check connectivity', async () => {
    // Simulate online response
    setTimeout(() => {
      if (mockRequestEvents.response) {
        mockRequestEvents.response({ statusCode: 200 });
      }
    }, 10);

    await connectivityManager.initialize();

    expect(net.request).toHaveBeenCalledWith(expect.objectContaining({
      method: 'HEAD',
      url: expect.any(String)
    }));
    expect(connectivityManager.getStatus().online).toBe(true);
    expect(connectivityManager.pollTimer).toBeDefined();
  });

  it('should detect offline status on error', async () => {
    // Force initial state to online
    connectivityManager.isOnline = true;

    // Simulate request error
    setTimeout(() => {
      if (mockRequestEvents.error) {
        mockRequestEvents.error(new Error('Network error'));
      }
    }, 10);

    const isOnline = await connectivityManager.checkConnectivity();

    expect(isOnline).toBe(false);
    expect(connectivityManager.isOnline).toBe(false);
  });

  it('should detect offline status on bad status code', async () => {
    connectivityManager.isOnline = true;

    // Simulate 404
    setTimeout(() => {
      if (mockRequestEvents.response) {
        mockRequestEvents.response({ statusCode: 404 });
      }
    }, 10);

    const isOnline = await connectivityManager.checkConnectivity();
    expect(isOnline).toBe(false);
  });

  it('should notify windows on status change', async () => {
    connectivityManager.isOnline = true;
    const mockWindow = {
      webContents: {
        send: vi.fn()
      },
      isDestroyed: () => false
    };
    BrowserWindow.getAllWindows.mockReturnValue([mockWindow]);

    // Go offline
    setTimeout(() => {
      if (mockRequestEvents.error) {
        mockRequestEvents.error(new Error('Connection lost'));
      }
    }, 10);

    await connectivityManager.checkConnectivity();

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.CONNECTIVITY_STATUS,
      expect.objectContaining({ online: false })
    );

    // Go online
    setTimeout(() => {
      if (mockRequestEvents.response) {
        mockRequestEvents.response({ statusCode: 200 });
      }
    }, 10);

    await connectivityManager.checkConnectivity();

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.CONNECTIVITY_STATUS,
      expect.objectContaining({ online: true })
    );
  });

  it('should notify listeners', async () => {
    connectivityManager.isOnline = true;
    const listener = vi.fn();
    connectivityManager.addListener(listener);

    // Go offline
    setTimeout(() => {
      if (mockRequestEvents.error) {
        mockRequestEvents.error(new Error('Connection lost'));
      }
    }, 10);

    await connectivityManager.checkConnectivity();

    expect(listener).toHaveBeenCalledWith(false);
  });
});
