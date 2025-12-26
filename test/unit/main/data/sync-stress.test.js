/**
 * Sync Queue Stress Tests
 * Verifies performance and stability under load
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncQueue } from '../../../../src/main/data/sync-queue';
import connectivityManager from '../../../../src/main/data/connectivity-manager';

// Mock dependencies
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/path'),
    getVersion: vi.fn(),
    getName: vi.fn().mockReturnValue('Test App'),
  },
  Notification: class {
    show = vi.fn();
    on = vi.fn();
  },
}));

vi.mock('electron-store', () => {
  return {
    default: class MockStore {
      constructor() {
        this.store = {};
      }
      get(key, defaultValue) {
        return this.store[key] || defaultValue;
      }
      set(key, value) {
        this.store[key] = value;
      }
    }
  };
});

vi.mock('../../../../src/main/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../../../../src/main/data/connectivity-manager', () => ({
  default: {
    isOnline: true,
    addListener: vi.fn(),
    getStatus: vi.fn().mockReturnValue({ online: true }),
  }
}));

describe('SyncQueue - Stress Tests', () => {
  let syncQueue;
  let mockAdapter;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Ensure getStatus returns valid object
    connectivityManager.getStatus.mockReturnValue({ online: true });

    // Setup mock adapter
    mockAdapter = {
      sync: vi.fn().mockResolvedValue({ success: true }),
    };

    // Reset connectivity
    connectivityManager.isOnline = true;

    syncQueue = new SyncQueue({
      maxQueueSize: 20000,
      autoSync: false // Manual processing for control
    });
    syncQueue.setAdapter(mockAdapter);
    await syncQueue.initialize();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle rapid enqueue of 1000 items', async () => {
    const itemCount = 1000;
    const operations = [];

    // Rapidly enqueue
    for (let i = 0; i < itemCount; i++) {
      operations.push(syncQueue.enqueue({
        type: 'create',
        entity: 'test',
        data: { index: i }
      }));
    }

    const results = await Promise.all(operations);

    // Verify all succeeded
    const failed = results.filter(r => !r.success);
    expect(failed.length).toBe(0);

    // Verify queue size
    const status = syncQueue.getStatus();
    expect(status.total).toBe(itemCount);
    expect(status.pending).toBe(itemCount);
  }, 10000); // Increase timeout

  it('should respect concurrency limits during processing', async () => {
    const itemCount = 20; // Small batch to verify concurrency

    // Setup adapter with delay to measure concurrency
    let activeSyncs = 0;
    let maxConcurrent = 0;

    mockAdapter.sync.mockImplementation(async () => {
      activeSyncs++;
      maxConcurrent = Math.max(maxConcurrent, activeSyncs);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));

      activeSyncs--;
      return { success: true };
    });

    // Enqueue items
    for (let i = 0; i < itemCount; i++) {
      await syncQueue.enqueue({ type: 'test', data: { i } });
    }

    // Process
    await syncQueue.process();

    // Verify limit (CONCURRENT_LIMIT is 3 in sync-queue.js)
    expect(maxConcurrent).toBeLessThanOrEqual(3);

    // Verify all processed
    const status = syncQueue.getStatus();
    expect(status.pending).toBe(0);
    expect(status.synced).toBe(itemCount);
  });

  it('should handle network flapping and retries', async () => {
    // Adapter fails on first attempt, succeeds on second
    let attempts = {};

    mockAdapter.sync.mockImplementation(async (op) => {
      attempts[op.id] = (attempts[op.id] || 0) + 1;

      if (attempts[op.id] === 1) {
        return { success: false, error: 'Network Error' };
      }
      return { success: true };
    });

    // Enqueue 5 items
    for (let i = 0; i < 5; i++) {
      await syncQueue.enqueue({ type: 'retry-test', data: { i } });
    }

    // First processing pass (all should fail)
    await syncQueue.process();

    let status = syncQueue.getStatus();
    expect(status.pending).toBe(5); // Still pending because they are retriable

    // Fast forward time? sync-queue uses Date.now(). 
    // We can't rely on real time wait if we want fast tests.
    // We can just manually reset lastAttempt in the store/queue if possible, 
    // OR we can mock Date.now().

    // Check retries count
    const queue = syncQueue.getQueue();
    expect(queue[0].retries).toBe(1);

    // Second processing pass - should succeed if backoff allows
    // sync-queue checks: timeSinceLastAttempt < delay
    // delay for retry 1 is 1000 * 2^1 = 2000ms.
    // We need to wait 2 seconds or mock Date.now();

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 2500); // Advance 2.5s

    await syncQueue.process();

    vi.useRealTimers();

    status = syncQueue.getStatus();
    expect(status.pending).toBe(0);
    expect(status.synced).toBe(5);
  });
});
