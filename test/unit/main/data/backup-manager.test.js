/**
 * Backup Manager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BackupManager } from '../../../../src/main/data/backup-manager.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/path'),
    getVersion: vi.fn(() => '1.0.0')
  }
}));

// Mock logger
vi.mock('../../../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

// Mock electron-store
vi.mock('electron-store', () => {
  const storeData = {
    'backup:history': []
  };
  
  return {
    default: class Store {
      constructor() {
        this.store = { test: 'data' };
      }
      get(key, defaultValue) {
        return storeData[key] !== undefined ? storeData[key] : defaultValue;
      }
      set(key, value) {
        storeData[key] = value;
      }
    }
  };
});

// Mock worker pool
vi.mock('../../../../src/main/workers/worker-pool.js', () => ({
  getZipWorkerPool: vi.fn(() => ({
    execute: vi.fn(async () => ({
      checksum: 'mock-checksum',
      size: 1024
    }))
  }))
}));

describe('BackupManager', () => {
  let backupManager;
  let testDir;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `test-backup-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    
    backupManager = new BackupManager({
      backupDir: testDir,
      maxBackups: 5
    });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('initialize', () => {
    it('should create backup directory if it does not exist', async () => {
      await backupManager.initialize();
      const stats = await fs.stat(testDir);
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe('createBackup', () => {
    it('should create a backup with metadata', async () => {
      const result = await backupManager.createBackup({ type: 'manual' });
      
      expect(result.success).toBe(true);
      expect(result.backup).toHaveProperty('filename');
      expect(result.backup).toHaveProperty('path');
      expect(result.backup).toHaveProperty('timestamp');
    });

    it('should include manifest in backup', async () => {
      const result = await backupManager.createBackup({ type: 'auto' });
      
      expect(result.backup).toHaveProperty('version');
      expect(result.backup).toHaveProperty('platform');
      expect(result.backup.includes).toBeDefined();
    });

    it('should handle backup creation errors gracefully', async () => {
      // Force an error by using invalid path
      const badManager = new BackupManager({ backupDir: '/invalid/path/\0bad' });
      
      await expect(badManager.createBackup()).rejects.toThrow();
    });
  });

  describe('listBackups', () => {
    it('should return empty list when no backups exist', async () => {
      const result = await backupManager.listBackups();
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.backups)).toBe(true);
      expect(result.backups.length).toBe(0);
    });

    it('should list available backups', async () => {
      // Create a backup first
      await backupManager.createBackup({ type: 'manual' });
      
      const result = await backupManager.listBackups();
      
      expect(result.success).toBe(true);
      expect(result.backups.length).toBeGreaterThan(0);
    });
  });

  describe('deleteBackup', () => {
    it('should delete a backup file', async () => {
      // Create backup
      const createResult = await backupManager.createBackup({ type: 'manual' });
      const filename = createResult.backup.filename;
      
      // Delete it
      const deleteResult = await backupManager.deleteBackup(filename);
      
      expect(deleteResult.success).toBe(true);
    });

    it('should handle non-existent backup deletion', async () => {
      const result = await backupManager.deleteBackup('nonexistent.zip');
      
      // Should fail gracefully
      expect(result.success).toBe(false);
    });
  });

  describe('cleanupOldBackups', () => {
    it('should respect maxBackups limit', async () => {
      // Create more backups than the limit
      for (let i = 0; i < 7; i++) {
        await backupManager.createBackup({ type: 'auto' });
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const result = await backupManager.listBackups();
      
      // Should only keep maxBackups (5)
      expect(result.backups.length).toBeLessThanOrEqual(5);
    });
  });

  describe('calculateChecksum', () => {
    it('should calculate SHA-256 checksum', async () => {
      // Create a test file
      const testFile = path.join(testDir, 'test.txt');
      await fs.writeFile(testFile, 'test content');
      
      const checksum = await backupManager.calculateChecksum(testFile);
      
      expect(checksum).toBeDefined();
      expect(typeof checksum).toBe('string');
      expect(checksum.length).toBe(64); // SHA-256 produces 64 hex characters
    });
  });
});
