
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import syncQueue from '../../../../src/main/data/sync-queue.js';
import connectivityManager from '../../../../src/main/data/connectivity-manager.js';

// Mock Dependencies
vi.mock('electron-store', () => {
  return {
    default: class {
      constructor() {
        this.data = {};
      }
      get(key, defaultValue) {
        return this.data[key] || defaultValue;
      }
      set(key, value) {
        this.data[key] = value;
      }
    }
  };
});

vi.mock('../../../../src/main/data/connectivity-manager.js', () => ({
  default: {
    isOnline: true,
    addListener: vi.fn(),
    getStatus: () => ({ online: true })
  }
}));

vi.mock('../../../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('SyncQueue', () => {
  let mockAdapter;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset queue state
    syncQueue.store.data = {};
    syncQueue.processing = false;

    // Mock adapter
    mockAdapter = {
      sync: vi.fn().mockResolvedValue({ success: true })
    };
    syncQueue.setAdapter(mockAdapter);

    // Set default online state
    connectivityManager.isOnline = true;
  });

  it('should enqueue operation and save to store', async () => {
    const operation = {
      type: 'CREATE',
      entity: 'TEST',
      data: { foo: 'bar' }
    };

    const result = await syncQueue.enqueue(operation);

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();

    const queue = syncQueue.getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].type).toBe('CREATE');
    expect(queue[0].status).toBe('pending');
  });

  it('should process queue when online', async () => {
    // Add pending op
    await syncQueue.enqueue({ type: 'TEST', data: {} });

    // Trigger process
    const result = await syncQueue.process();

    expect(result.success).toBe(true);
    expect(result.processed).toBe(1);
    expect(mockAdapter.sync).toHaveBeenCalled();

    const queue = syncQueue.getQueue();
    expect(queue[0].status).toBe('synced');
  });

  it('should not process when offline', async () => {
    connectivityManager.isOnline = false;

    await syncQueue.enqueue({ type: 'TEST', data: {} });

    const result = await syncQueue.process();

    expect(result.success).toBe(false);
    expect(result.message).toContain('Offline');
    expect(mockAdapter.sync).not.toHaveBeenCalled();
  });

  it('should handle sync failures and increment retries', async () => {
    mockAdapter.sync.mockResolvedValue({ success: false, error: 'Network Error' });

    await syncQueue.enqueue({ type: 'TEST', data: {} });

    const result = await syncQueue.process();

    expect(result.processed).toBe(0);
    expect(mockAdapter.sync).toHaveBeenCalled();

    const queue = syncQueue.getQueue();
    expect(queue[0].status).toBe('pending'); // Stays pending for retry
    expect(queue[0].retries).toBe(1);
    expect(queue[0].error).toBe('Network Error');
  });

  it('should mark as failed after max retries', async () => {
    mockAdapter.sync.mockResolvedValue({ success: false, error: 'Fatal Error' });

    // Enqueue
    await syncQueue.enqueue({ type: 'TEST', data: {} });

    // Manually set retries to max
    const queue = syncQueue.getQueue();
    queue[0].retries = 5; // Assuming MAX_RETRIES is 5
    syncQueue.saveQueue(queue);

    const result = await syncQueue.process();

    expect(result.failed).toBe(1);

    const updatedQueue = syncQueue.getQueue();
    expect(updatedQueue[0].status).toBe('failed');
  });

  it('should respect retry backoff', async () => {
    mockAdapter.sync.mockResolvedValue({ success: false, error: 'Backoff Test' });

    await syncQueue.enqueue({ type: 'TEST', data: {} });

    // First attempt
    await syncQueue.process();

    const queue = syncQueue.getQueue();
    const lastAttempt = queue[0].lastAttempt;

    vi.mocked(mockAdapter.sync).mockClear();

    // Second process attempt immediately (should skip due to backoff)
    // We assume backoff > 0ms
    await syncQueue.process();

    expect(mockAdapter.sync).not.toHaveBeenCalled();
  });
});
