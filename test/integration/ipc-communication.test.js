import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ipcMain } from 'electron';
import { ipcBridge } from '../../src/main/ipc/bridge.js';
import { IPC_CHANNELS } from '../../src/common/constants.js';

// Mock dependencies
vi.mock('electron', () => {
  const handlers = new Map();
  return {
    ipcMain: {
      handle: vi.fn((channel, handler) => {
        handlers.set(channel, handler);
      }),
      handlers,
      removeHandler: vi.fn()
    },
    app: {
      getVersion: vi.fn(() => '1.0.0'),
      getPath: vi.fn((name) => `/mock/${name}`),
      getName: vi.fn(() => 'TestApp'),
      quit: vi.fn(),
      relaunch: vi.fn(),
    },
    BrowserWindow: {
      getAllWindows: vi.fn(() => []),
      fromWebContents: vi.fn(),
    },
    dialog: {
      showOpenDialog: vi.fn(),
      showSaveDialog: vi.fn(),
      showMessageBox: vi.fn(),
      showErrorBox: vi.fn(),
    },
    safeStorage: {
      isEncryptionAvailable: vi.fn(() => false),
    }
  };
});

vi.mock('../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }
}));

vi.mock('electron-store', () => {
  return {
    default: class {
      constructor() {
        this.store = {};
      }
      get(key) { return this.store[key]; }
      set(key, value) { this.store[key] = value; }
      delete(key) { delete this.store[key]; }
      has(key) { return key in this.store; }
      clear() { this.store = {}; }
    }
  };
});

import { createAppHandlers } from '../../src/main/ipc/handlers/app.js';
import { createDialogHandlers } from '../../src/main/ipc/handlers/dialog.js';
import * as bridge from '../../src/main/ipc/bridge.js';

describe('IPC Communication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Register handlers
    const schema = {
      [IPC_CHANNELS.APP_GET_VERSION]: {
        input: {},
        output: { type: 'object' }
      },
      [IPC_CHANNELS.APP_GET_PATH]: {
        input: { name: { type: 'string', required: true } },
        output: { type: 'object' }
      }
    };

    const handlers = {
      ...createAppHandlers(),
      ...createDialogHandlers()
    };

    // Register handlers using the bridge
    bridge.registerHandlers(schema, handlers);
  });

  const invokeIpc = async (channel, payload) => {
    const handler = ipcMain.handlers.get(channel);
    if (!handler) {
      throw new Error(`No handler registered for ${channel}`);
    }
    // Simulate IPC event
    const event = { sender: { send: vi.fn() } };
    return handler(event, payload);
  };

  it('should successfully handle APP_GET_VERSION', async () => {
    const response = await invokeIpc(IPC_CHANNELS.APP_GET_VERSION, {});
    expect(response.app).toBe('1.0.0');
    expect(response.node).toBeDefined();
  });

  it('should successfully handle APP_GET_PATH', async () => {
    const response = await invokeIpc(IPC_CHANNELS.APP_GET_PATH, { name: 'userData' });
    expect(response.path).toBe('/mock/userData');
  });

  it('should throw validation error for invalid payload in APP_GET_PATH', async () => {
    // Note: Bridge creates a wrapper that handles validation.
    // If we call the handler directly from the map, we are calling the WRAPPED handler.
    const result = await invokeIpc(IPC_CHANNELS.APP_GET_PATH, { name: 123 });
    expect(result.success).toBe(false);
    expect(result.code).toBe('VALIDATION_ERROR');
  });
});
