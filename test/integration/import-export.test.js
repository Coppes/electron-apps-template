
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';

// Mock electron-store to avoid initialization errors
vi.mock('electron-store', () => {
  return {
    default: class {
      constructor() {
        this.store = { test: 'settings' };
      }
    }
  };
});

import importExportManager from '../../src/main/data/import-export.js';


// Mock app.getPath if not available in environment
describe('Import/Export Integration', () => {
  // Use a local temp directory for integration tests to avoid mocked path issues
  const tempDir = path.join(process.cwd(), 'temp-test-import-export');

  beforeAll(async () => {
    // Ensure parent dir could be created if needed, though cwd should be writable
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.error('Cleanup failed:', err);
    }
  });

  it('should round-trip JSON data', async () => {
    const data = {
      test: 'integration',
      numbers: [1, 2, 3],
      nested: { object: true }
    };

    const filePath = path.join(tempDir, 'test.json');

    // 1. Export
    const exportResult = await importExportManager.export(filePath, data);
    expect(exportResult.success).toBe(true);
    expect(exportResult.format).toBe('json');

    // Check file exists
    const fileStats = await fs.stat(filePath);
    expect(fileStats.size).toBeGreaterThan(0);

    // 2. Import
    const importResult = await importExportManager.import(filePath);
    expect(importResult.success).toBe(true);
    expect(importResult.data).toEqual(data);
  });

  it('should round-trip CSV data', async () => {
    const data = [
      { id: '1', name: 'Test' },
      { id: '2', name: 'Integration' }
    ];

    const filePath = path.join(tempDir, 'test.csv');

    // 1. Export
    const exportResult = await importExportManager.export(filePath, data);
    expect(exportResult.success).toBe(true);

    // 2. Import
    const importResult = await importExportManager.import(filePath);
    expect(importResult.success).toBe(true);
    // CSV import implies string values usually, check loose equality or implement strict parsing
    expect(importResult.data).toEqual(data);
  });

  it('should convert JSON to CSV', async () => {
    const data = [
      { id: '1', value: 'A' },
      { id: '2', value: 'B' }
    ];

    const jsonPath = path.join(tempDir, 'convert-source.json');
    const csvPath = path.join(tempDir, 'convert-target.csv');

    await importExportManager.export(jsonPath, data);

    const convertResult = await importExportManager.convert(jsonPath, csvPath, {
      fromFormat: 'json',
      toFormat: 'csv'
    });

    expect(convertResult.success).toBe(true);

    const csvContent = await fs.readFile(csvPath, 'utf8');
    expect(csvContent).toContain('id,value');
    expect(csvContent).toContain('1,A');
  });
});
