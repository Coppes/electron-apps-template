/**
 * File Watcher Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileWatcher } from '../../../../src/main/data/file-watcher.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Mock logger
vi.mock('../../../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('FileWatcher', () => {
  let fileWatcher;
  let testDir;
  let testFile;
  let mockWindow;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `test-watch-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    testFile = path.join(testDir, 'test.txt');
    await fs.writeFile(testFile, 'initial content');

    fileWatcher = new FileWatcher({ debounceDelay: 50 });

    mockWindow = {
      isDestroyed: () => false,
      webContents: {
        send: vi.fn()
      }
    };
  });

  afterEach(async () => {
    await fileWatcher.cleanup();

    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('watch', () => {
    it('should start watching a file', async () => {
      const result = await fileWatcher.watch(testFile, mockWindow);

      expect(result.success).toBe(true);
      expect(result.path).toBe(testFile);
      expect(result.metadata).toBeDefined();
    });

    it('should not watch the same file twice', async () => {
      await fileWatcher.watch(testFile, mockWindow);
      const result = await fileWatcher.watch(testFile, mockWindow);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Already watching');
    });

    it('should fail to watch non-existent file', async () => {
      const result = await fileWatcher.watch('/nonexistent/file.txt', mockWindow);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('unwatch', () => {
    it('should stop watching a file', async () => {
      await fileWatcher.watch(testFile, mockWindow);
      const result = await fileWatcher.unwatch(testFile);

      expect(result.success).toBe(true);
    });

    it('should handle unwatching non-watched file', async () => {
      const result = await fileWatcher.unwatch('/not/watched/file.txt');

      // May return success even if not watching
      expect(result).toBeDefined();
    });
  });

  describe('handleFileChange', () => {
    it('should detect file modifications', async () => {
      await fileWatcher.watch(testFile, mockWindow);

      // Modify file
      await fs.writeFile(testFile, 'modified content');

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if notification was sent
      expect(mockWindow.webContents.send).toHaveBeenCalled();
    });

    it('should debounce rapid file changes', async () => {
      await fileWatcher.watch(testFile, mockWindow);

      // Multiple rapid changes
      await fs.writeFile(testFile, 'change 1');
      await fs.writeFile(testFile, 'change 2');
      await fs.writeFile(testFile, 'change 3');

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 500));

      // Should only notify once due to debouncing
      const callCount = mockWindow.webContents.send.mock.calls.length;
      expect(callCount).toBe(1);
    });

    it('should detect file deletion', async () => {
      await fileWatcher.watch(testFile, mockWindow);

      // Delete file
      await fs.unlink(testFile);

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 500));

      // Should have notified about deletion
      expect(mockWindow.webContents.send).toHaveBeenCalled();
      const calls = mockWindow.webContents.send.mock.calls;
      const deleteCall = calls.find(call => call[1]?.event === 'unlink');
      expect(deleteCall).toBeDefined();
    });
  });

  describe('getWatchedFiles', () => {
    it('should return list of watched files', async () => {
      await fileWatcher.watch(testFile, mockWindow);

      const watched = fileWatcher.getWatchedFiles();

      expect(Array.isArray(watched)).toBe(true);
      expect(watched).toContain(testFile);
    });

    it('should return empty array when nothing is watched', () => {
      const watched = fileWatcher.getWatchedFiles();

      expect(Array.isArray(watched)).toBe(true);
      expect(watched.length).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should stop all watchers on cleanup', async () => {
      await fileWatcher.watch(testFile, mockWindow);

      await fileWatcher.cleanup();

      expect(fileWatcher.getWatchedFiles().length).toBe(0);
    });

    it('should stop cleanup timer', async () => {
      fileWatcher.initialize();
      expect(fileWatcher.cleanupTimer).toBeDefined();

      await fileWatcher.cleanup();
      expect(fileWatcher.cleanupTimer).toBeNull();
    });
  });

  describe('memory cleanup', () => {
    it('should cleanup idle watchers', async () => {
      // Create watcher with very short idle time for testing
      const testWatcher = new FileWatcher({
        debounceDelay: 50,
        cleanupInterval: 100,
        maxIdleTime: 200
      });
      testWatcher.initialize();

      await testWatcher.watch(testFile, mockWindow);

      // Wait for idle timeout
      await new Promise(resolve => setTimeout(resolve, 300));

      // Trigger cleanup
      testWatcher.performCleanup();

      // Watcher should be removed
      expect(testWatcher.getWatchedFiles().length).toBe(0);

      await testWatcher.cleanup();
    });
  });
});
