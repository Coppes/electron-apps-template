
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import syncQueue from '../../../../src/main/data/sync-queue.ts';
import connectivityManager from '../../../../src/main/data/connectivity-manager.ts';

// Mock dependencies
// connectivityManager.isOnline is accessed as a property in SyncQueue.ts
// So we mock it as a property that we can toggle.
vi.mock('../../../../src/main/data/connectivity-manager.ts', () => {
  const manager = {
    isOnline: true, // Default to true
    on: vi.fn(),
    off: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    initialize: vi.fn(),
    cleanup: vi.fn()
  };
  return { default: manager };
});

vi.mock('electron-store', () => {
  const store = {};
  return {
    default: class Store {
      constructor() { this.store = store; }
      get(key, defaultValue) { return this.store[key] ?? defaultValue; }
      set(key, val) { this.store[key] = val; }
      delete(key) { delete this.store[key]; }
      clear() { this.store = {}; }
    }
  };
});

vi.mock('../../../../src/main/notifications.ts', () => ({
  notificationManager: {
    showNotification: vi.fn().mockResolvedValue()
  }
}));

vi.mock('../../../../src/main/logger.ts', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

import { notificationManager } from '../../../../src/main/notifications.ts';

describe('SyncQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to online
    connectivityManager.isOnline = true;
  });

  describe('enqueue', () => {
    it('should add item to queue and save', async () => {
      const item = { type: 'create', data: { name: 'test' } };
      await syncQueue.enqueue(item);

      const queue = syncQueue.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0]).toMatchObject({
        ...item,
        status: 'pending'
      });
    });
  });

  describe('process', () => {
    const mockAdapter = {
      sync: vi.fn().mockResolvedValue({ success: true, id: 1 })
    };

    beforeEach(() => {
      syncQueue.clear();
      syncQueue.setAdapter(mockAdapter);
      mockAdapter.sync.mockClear();
    });

    it('should process queue when online and show notification', async () => {
      await syncQueue.enqueue({ type: 'create', data: { name: 'test' } });

      const result = await syncQueue.process();

      expect(result.success).toBe(true);
      expect(mockAdapter.sync).toHaveBeenCalled();

      const queue = syncQueue.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].status).toBe('synced');

      expect(notificationManager.showNotification).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sync Complete'
      }));
    });

    it('should not process when offline', async () => {
      // Set offline
      connectivityManager.isOnline = false;

      await syncQueue.enqueue({ type: 'create', data: { name: 'test' } });

      const result = await syncQueue.process();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Offline');
      expect(mockAdapter.sync).not.toHaveBeenCalled();
    });
  });
});
