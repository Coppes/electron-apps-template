
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImportExportManager } from '../../../../src/main/data/import-export.js';
import path from 'path';
import fs from 'fs/promises';

// Mock fs and path
vi.mock('fs/promises');

describe('ImportExportManager', () => {
  let manager;
  // Create a minimal fake handler
  const mockHandler = {
    export: vi.fn().mockResolvedValue('mock-content'),
    import: vi.fn().mockResolvedValue({ mock: 'data' }),
    validate: vi.fn().mockReturnValue({ valid: true }),
    canHandle: vi.fn().mockReturnValue(true)
  };

  beforeEach(() => {
    manager = new ImportExportManager();
    manager.registerHandler('json', mockHandler);
    vi.clearAllMocks();
  });

  describe('Registration and Detection', () => {
    it('should register and retrieve handlers', () => {
      expect(manager.getHandler('json')).toBe(mockHandler);
    });

    it('should auto-detect format from extension', () => {
      expect(manager.detectFormat('test.json')).toBe('json');
      expect(manager.detectFormat('test.csv')).toBe('csv');
      expect(manager.detectFormat('test.txt')).toBeNull();
    });
  });

  describe('Export', () => {
    it('should export data using registered handler', async () => {
      const filePath = '/test/file.json';
      // Mock fs.writeFile
      fs.writeFile.mockResolvedValue(undefined);

      const result = await manager.export(filePath, { some: 'data' });

      expect(result.success).toBe(true);
      expect(mockHandler.export).toHaveBeenCalledWith({ some: 'data' }, {});
      expect(fs.writeFile).toHaveBeenCalledWith(filePath, 'mock-content', 'utf8');
    });

    it('should fail if no handler found', async () => {
      const result = await manager.export('/test/file.unknown', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not determine format');
    });
  });

  describe('Import', () => {
    it('should import data using registered handler', async () => {
      const filePath = '/test/file.json';
      fs.stat.mockResolvedValue({ size: 100 });
      fs.readFile.mockResolvedValue('mock-file-content');

      const result = await manager.import(filePath);

      expect(result.success).toBe(true);
      expect(fs.readFile).toHaveBeenCalledWith(filePath, 'utf8');
      expect(mockHandler.import).toHaveBeenCalledWith('mock-file-content', {});
      expect(result.data).toEqual({ mock: 'data' });
    });

    it('should fail if file is too large', async () => {
      const filePath = '/test/huge.json';
      // 200MB file
      fs.stat.mockResolvedValue({ size: 200 * 1024 * 1024 });

      const result = await manager.import(filePath);
      expect(result.success).toBe(false);
      expect(result.error).toContain('File too large');
    });
  });
});
