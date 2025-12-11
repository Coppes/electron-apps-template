import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { BackupManager } from '../../src/main/data/backup-manager.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock Electron - MUST return valid path for module-level calls
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/electron-benchmark-test'), // valid fallback
    getVersion: vi.fn(() => '1.0.0'),
  },
  ipcMain: {
    handle: vi.fn(),
  },
}));

// Mock Logger - prevent top-level crash
vi.mock('../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn((...args) => console.log('[INFO]', ...args)),
    warn: vi.fn((...args) => console.warn('[WARN]', ...args)),
    error: vi.fn((...args) => console.error('[ERROR]', ...args)),
    debug: vi.fn((...args) => console.debug('[DEBUG]', ...args)),
  }
}));

vi.mock('electron-store', () => {
  const mockStore = {
    get: vi.fn((key, def) => def || []),
    set: vi.fn(),
    store: { enc: 'mock-encrypted-data' }
  };

  return {
    default: class {
      constructor() {
        return mockStore;
      }
    }
  };
});

import { app } from 'electron';

describe('Backup Performance Benchmark', () => {
  let backupManager;
  let tempDir;
  let backupDir;
  let mockSecureStorage;
  const ATTEMPTS = 3;
  const FILE_COUNT = 100; // 100 files
  const FILE_SIZE = 100 * 1024; // 100KB each -> ~10MB total

  beforeAll(async () => {
    // Setup temp directories
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'electron-backup-bench-'));
    backupDir = path.join(tempDir, 'backups');
    fs.mkdirSync(backupDir);

    // Mock app.getPath
    app.getPath.mockImplementation((name) => {
      if (name === 'userData') return tempDir;
      return tempDir;
    });

    // Create dummy data
    const dataDir = path.join(tempDir, 'data'); // Simulate userData structure
    // BackupManager typically backs up specific files or whole userData?
    // In code: `fs.cp(this.userDataPath, tempDir ...)` excluding backups/extensions/etc.
    // So if we populate tempDir (userData), it will back it up.

    // Create user-files directory
    const userFilesDir = path.join(tempDir, 'user-files');
    fs.mkdirSync(userFilesDir);

    // Create dummy data in user-files
    for (let i = 0; i < FILE_COUNT; i++) {
      fs.writeFileSync(path.join(userFilesDir, `file-${i}.dat`), Buffer.alloc(FILE_SIZE, 'a'));
    }

    // Mock SecureStorage
    mockSecureStorage = {
      store: {
        store: {
          enc: 'mock-encrypted-data'
        }
      },
      get: vi.fn(),
      set: vi.fn(),
    };

    backupManager = new BackupManager({
      includeUserFiles: true,
      backupDir: backupDir
    });
  });

  afterAll(() => {
    // Cleanup
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Failed to cleanup temp dir:', e);
    }
  });

  it('measures backup creation time', async () => {
    console.log(`\nStarting Benchmark: Create Backup (${FILE_COUNT} files, ${(FILE_COUNT * FILE_SIZE) / 1024 / 1024} MB)`);

    let totalTime = 0;

    for (let i = 0; i < ATTEMPTS; i++) {
      const start = performance.now();
      await backupManager.createBackup({ useWorker: false });
      const end = performance.now();
      const duration = end - start;
      console.log(`Run ${i + 1}: ${duration.toFixed(2)}ms`);
      totalTime += duration;

      // Cleanup backups to avoid accumulating ? No, we want to test restore.
      // Actually createBackup creates specific filename.
    }

    console.log(`Average Create Time: ${(totalTime / ATTEMPTS).toFixed(2)}ms`);
    expect(totalTime / ATTEMPTS).toBeLessThan(5000); // Expect < 5s for 10MB
  });

  it('measures restore time', async () => {
    // First ensure we have a backup
    const result = await backupManager.createBackup({ useWorker: false });
    const backupFilename = result.backup.filename;

    console.log(`\nStarting Benchmark: Restore Backup`);

    let totalTime = 0;

    for (let i = 0; i < ATTEMPTS; i++) {
      const start = performance.now();
      await backupManager.restoreBackup(backupFilename);
      const end = performance.now();
      const duration = end - start;
      console.log(`Run ${i + 1}: ${duration.toFixed(2)}ms`);
      totalTime += duration;
    }

    console.log(`Average Restore Time: ${(totalTime / ATTEMPTS).toFixed(2)}ms`);
    expect(totalTime / ATTEMPTS).toBeLessThan(5000);
  });
});
