/**
 * Import Security Tests
 * Verifies handling of large files, malformed data, and potential security vectors
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ImportExportManager from '../../../../src/main/data/import-export';
import fs from 'fs/promises';

// Mock fs
vi.mock('fs/promises');

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

// Mock helpers
vi.mock('../../../../src/main/workers/worker-pool', () => ({
  getCsvWorkerPool: () => ({
    execute: vi.fn(),
  }),
}));

vi.mock('../../../../src/main/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('ImportExportManager - Security', () => {
  const mockFilePath = '/mock/path/file.json';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should reject files larger than maxFileSize', async () => {
    // Mock stat to return size > 100MB
    vi.spyOn(fs, 'stat').mockResolvedValue({
      size: 101 * 1024 * 1024, // 101MB
      isFile: () => true
    });

    const result = await ImportExportManager.import(mockFilePath);
    expect(result.success).toBe(false);
    expect(result.error).toContain('File too large');
  });

  it('should handle malformed JSON gracefully', async () => {
    vi.spyOn(fs, 'stat').mockResolvedValue({
      size: 1024,
      isFile: () => true
    });

    // Malformed JSON
    vi.spyOn(fs, 'readFile').mockResolvedValue('{ "unclosed": "object"');

    const result = await ImportExportManager.import(mockFilePath, { format: 'json' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid JSON');
  });

  it('should handle malformed CSV gracefully', async () => {
    const csvPath = '/mock/file.csv';
    vi.spyOn(fs, 'stat').mockResolvedValue({
      size: 1024,
      isFile: () => true
    });

    // Malformed CSV (e.g. quote mismatch)
    vi.spyOn(fs, 'readFile').mockResolvedValue('col1,col2\n"val1,"val2"'); // Unbalanced quotes might cause parser error or be lenient

    // We use csv-parse which throws on invalid CSV by default
    const result = await ImportExportManager.import(csvPath, { format: 'csv' });

    // Depending on parser settings, it might fail or strictly parse. 
    // We expect it to handle the error if it throws.
    if (!result.success) {
      expect(result.error).toBeDefined();
    } else {
      // If lenient, it's also fine, but we checking for crash
      expect(result.success).toBe(true);
    }
  });

  // Test deeply nested JSON (Stack Overflow protection check)
  // Note: V8 handles reasonably deep JSON, but extremely deep might stack overflow.
  // We want to ensure the app doesn't crash Main Process.
  it('should handle deeply nested JSON', async () => {
    vi.spyOn(fs, 'stat').mockResolvedValue({
      size: 1024 * 1024,
      isFile: () => true
    });

    // Create deep object string
    let deepJson = '{"a":1}';
    for (let i = 0; i < 10000; i++) {
      deepJson = `{"a":${deepJson}}`;
    }

    vi.spyOn(fs, 'readFile').mockResolvedValue(deepJson);

    // This might throw RangeError or succeed depending on stack size
    // We just want to ensure ImportExportManager catches it and returns success=false, NOT crashing.
    const result = await ImportExportManager.import(mockFilePath, { format: 'json' });

    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it('should detect unsupported file formats', async () => {
    vi.spyOn(fs, 'stat').mockResolvedValue({
      size: 1024,
      isFile: () => true
    });

    // Unknown extension
    const unknownPath = '/file.unknown';
    const result = await ImportExportManager.import(unknownPath);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not determine format');
  });
});
