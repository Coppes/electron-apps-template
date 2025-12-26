
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImportExportManager } from '../../../../src/main/data/import-export.js';
import path from 'path';
import fs from 'fs/promises';

// Mock fs and path
// Mock fs and path
vi.mock('fs/promises');
vi.mock('electron-store', () => {
  return {
    default: class {
      constructor() {
        this.store = { mock: 'store' };
      }
    }
  };
});

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
      expect(fs.writeFile).toHaveBeenCalledWith(filePath, 'mock-content');
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

  describe('Convert', () => {
    it('should convert data from one format to another', async () => {
      // Setup
      fs.stat.mockResolvedValue({ size: 100 });
      fs.readFile.mockResolvedValue('mock-json-content');
      fs.writeFile.mockResolvedValue(undefined);

      const csvMockHandler = {
        import: vi.fn(),
        export: vi.fn().mockResolvedValue('mock-csv-content'),
        validate: vi.fn().mockReturnValue({ valid: true }),
        canHandle: vi.fn().mockReturnValue(true)
      };
      manager.registerHandler('csv', csvMockHandler);

      const result = await manager.convert('/test/source.json', '/test/target.csv', { fromFormat: 'json', toFormat: 'csv' });

      expect(result.success).toBe(true);
      expect(result.fromFormat).toBe('json');
      expect(result.toFormat).toBe('csv');

      // Check if import was called (json handler)
      expect(mockHandler.import).toHaveBeenCalled();

      // Check if export was called with imported data (csv handler)
      // Note: mockHandler.import returns { mock: 'data' }
      expect(csvMockHandler.export).toHaveBeenCalledWith({ mock: 'data' }, {});
      expect(fs.writeFile).toHaveBeenCalledWith('/test/target.csv', 'mock-csv-content');
    });

    it('should fail if import fails', async () => {
      fs.stat.mockRejectedValue(new Error('File not found'));

      const result = await manager.convert('/test/missing.json', '/test/target.csv');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Conversion failed at import step');
    });
  });

  describe('Presets', () => {
    it('should register and use export presets', async () => {
      // Mock data provider
      const mockDataProvider = vi.fn().mockResolvedValue({ preset: 'data' });
      manager.registerPreset('test-preset', mockDataProvider);

      expect(manager.listPresets()).toContain('test-preset');

      // Setup export mock
      const filePath = '/test/preset.json';
      fs.writeFile.mockResolvedValue(undefined);

      const result = await manager.exportPreset(filePath, 'test-preset', { format: 'json' });

      expect(result.success).toBe(true);
      expect(mockDataProvider).toHaveBeenCalled();
      expect(mockHandler.export).toHaveBeenCalledWith({ preset: 'data' }, {});
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should fail if preset not found', async () => {
      const result = await manager.exportPreset('/test/file.json', 'unknown-preset');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Preset not found');
    });
  });

  describe('Progress Reporting', () => {
    it('should report progress during import', async () => {
      const filePath = '/test/progress.json';
      const fileContent = '{"some":"data"}';
      fs.stat.mockResolvedValue({ size: fileContent.length });
      fs.readFile.mockResolvedValue(fileContent);

      const onProgress = vi.fn();

      await manager.import(filePath, { onProgress });

      // Should be called at least twice (start, complete)
      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ phase: 'start' }));
      expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ phase: 'complete' }));
    });

    it('should report progress during export', async () => {
      const filePath = '/test/progress-export.json';
      fs.writeFile.mockResolvedValue(undefined);

      const onProgress = vi.fn();

      await manager.export(filePath, { data: 'test' }, { onProgress });

      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ phase: 'start' }));
      expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ phase: 'complete' }));
    });
  });
});
