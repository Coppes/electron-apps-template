import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';
import fileWatcher from '../../../../../src/main/data/file-watcher.js';
import fs from 'fs/promises';
import { watch } from 'fs';
import path from 'path';

// Mock dependnecies
vi.mock('fs/promises');
vi.mock('fs', () => ({
  watch: vi.fn(),
}));
vi.mock('../../../../../src/main/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('FileWatcher Batching', () => {
  let mockWindow;
  let mockWatcher;
  let watchCallback;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockWindow = {
      isDestroyed: () => false,
      webContents: {
        send: vi.fn(),
      },
    };

    mockWatcher = {
      close: vi.fn(),
    };

    // Capture the callback passed to fs.watch
    vi.mocked(watch).mockImplementation((path, options, cb) => {
      if (typeof options === 'function') {
        watchCallback = options;
      } else {
        watchCallback = cb;
      }
      return mockWatcher;
    });

    // Mock fs.stat for metadata
    vi.mocked(fs.stat).mockResolvedValue({
      size: 1024,
      mtime: new Date(),
      isDirectory: () => true, // Simulate directory by default for this test
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    fileWatcher.watchers.clear();
  });

  it('should batch multiple events including generic directory changes', async () => {
    const dirPath = '/tmp/test-dir';
    await fileWatcher.watch(dirPath, mockWindow);

    expect(watchCallback).toBeDefined();

    // Trigger series of events:
    // 1. Specific file change
    watchCallback('rename', 'test.txt');
    // 2. Generic directory change (often null or empty on some OS/contexts, sometimes same filename)
    watchCallback('change', null);
    // 3. Another specific file
    watchCallback('rename', 'other.txt');

    // Wait for debounce but do NOT advance timers yet to ensure batching happens

    // Now advance time to trigger the batched processing
    await vi.advanceTimersByTimeAsync(350);

    // Should have checked metadata for specific files AND the directory itself (due to null event)
    expect(fs.stat).toHaveBeenCalledWith(path.join(dirPath, 'test.txt'));
    expect(fs.stat).toHaveBeenCalledWith(path.join(dirPath, 'other.txt'));
    expect(fs.stat).toHaveBeenCalledWith(dirPath);

    // Verify notifications sent
    expect(mockWindow.webContents.send).toHaveBeenCalledTimes(3);

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      expect.stringContaining('file:changed'),
      expect.objectContaining({ path: path.join(dirPath, 'test.txt') })
    );
    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      expect.stringContaining('file:changed'),
      expect.objectContaining({ path: path.join(dirPath, 'other.txt') })
    );
    // Notification for directory itself
    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      expect.stringContaining('file:changed'),
      expect.objectContaining({ path: dirPath })
    );
  });

  it('should update window reference when re-watching', async () => {
    const filePath = '/tmp/test-file.txt';
    await fileWatcher.watch(filePath, mockWindow);

    const newWindow = {
      isDestroyed: () => false,
      webContents: { send: vi.fn() }
    };

    // Watch same path with new window
    await fileWatcher.watch(filePath, newWindow);

    // Trigger event
    watchCallback('change', 'test-file.txt');
    await vi.advanceTimersByTimeAsync(350);

    // Should notify NEW window
    expect(newWindow.webContents.send).toHaveBeenCalled();
    expect(mockWindow.webContents.send).not.toHaveBeenCalled();
  });
});
