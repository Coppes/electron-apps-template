import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStoreHandlers, store } from '../../../../../src/main/ipc/handlers/store.js';
import { IPC_CHANNELS } from '../../../../../src/common/constants.js';

// Mock dependencies
vi.mock('electron-store', () => {
  return {
    default: class {
      constructor() {
        this.store = new Map();
      }
      get(key) { return this.store.get(key); }
      set(key, value) { this.store.set(key, value); }
      delete(key) { this.store.delete(key); }
      has(key) { return this.store.has(key); }
      clear() { this.store.clear(); }
    }
  };
});

vi.mock('../../../../../src/main/logger.js', () => ({
  logger: {
    error: vi.fn()
  }
}));

describe('Store IPC Handlers', () => {
  let handlers;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = createStoreHandlers();

    // Reset store state by using the exposed instance methods (since we mocked the class)
    // But since the module exports a singleton 'store', and we mocked the class, 'store' is an instance of our mock class.
    store.clear();
  });

  describe('GET', () => {
    it('should retrieve value from store', async () => {
      store.set('test-key', 'test-value');

      const handler = handlers[IPC_CHANNELS.STORE_GET];
      const result = await handler({}, { key: 'test-key' });

      expect(result).toEqual({ value: 'test-value' });
    });

    it('should return undefined for missing keys', async () => {
      const handler = handlers[IPC_CHANNELS.STORE_GET];
      const result = await handler({}, { key: 'missing' });

      expect(result).toEqual({ value: undefined });
    });
  });

  describe('SET', () => {
    it('should set value in store', async () => {
      const handler = handlers[IPC_CHANNELS.STORE_SET];
      const result = await handler({}, { key: 'new-key', value: 123 });

      expect(result.success).toBe(true);
      expect(store.get('new-key')).toBe(123);
    });
  });

  describe('DELETE', () => {
    it('should duplicate value from store', async () => {
      store.set('delete-me', true);

      const handler = handlers[IPC_CHANNELS.STORE_DELETE];
      const result = await handler({}, { key: 'delete-me' });

      expect(result.success).toBe(true);
      expect(store.has('delete-me')).toBe(false);
    });
  });

  describe('HAS', () => {
    it('should check if key exists', async () => {
      store.set('exists', true);

      const handler = handlers[IPC_CHANNELS.STORE_HAS];
      const result = await handler({}, { key: 'exists' });

      expect(result).toEqual({ exists: true });
    });

    it('should return false if key missing', async () => {
      const handler = handlers[IPC_CHANNELS.STORE_HAS];
      const result = await handler({}, { key: 'missing' });

      expect(result).toEqual({ exists: false });
    });
  });

  describe('CLEAR', () => {
    it('should clear all values', async () => {
      store.set('k1', 'v1');
      store.set('k2', 'v2');

      const handler = handlers[IPC_CHANNELS.STORE_CLEAR];
      const result = await handler();

      expect(result.success).toBe(true);
      expect(store.get('k1')).toBeUndefined();
      expect(store.get('k2')).toBeUndefined();
    });
  });
});
