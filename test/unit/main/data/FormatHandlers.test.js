
import { describe, it, expect } from 'vitest';
import { jsonHandler } from '../../../../src/main/data/format-handlers/json-handler.js';
import { csvHandler } from '../../../../src/main/data/format-handlers/csv-handler.js';

describe('Format Handlers', () => {
  describe('JSON Handler', () => {
    const testData = { key: 'value', number: 123, nested: { foo: 'bar' } };
    const testJson = JSON.stringify(testData, null, 2);

    it('should export data to JSON string', async () => {
      const result = await jsonHandler.export(testData);
      expect(result).toBe(testJson);
    });

    it('should import data from JSON string', async () => {
      const result = await jsonHandler.import(testJson);
      expect(result).toEqual(testData);
    });

    it('should validate JSON serializable data', () => {
      expect(jsonHandler.validate(testData).valid).toBe(true);
    });

    it('should detect valid JSON', () => {
      expect(jsonHandler.canHandle(testJson)).toBe(true);
      expect(jsonHandler.canHandle('invalid json')).toBe(false);
    });
  });

  describe('CSV Handler', () => {
    const testData = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' }
    ];

    it('should export array of objects to CSV', async () => {
      const result = await csvHandler.export(testData);
      expect(result).toContain('id,name');
      expect(result).toContain('1,Alice');
      expect(result).toContain('2,Bob');
    });

    it('should import CSV string to array of objects', async () => {
      const csvContent = 'id,name\n1,Alice\n2,Bob';
      const result = await csvHandler.import(csvContent);
      expect(result).toEqual(testData);
    });

    it('should validate array data', () => {
      expect(csvHandler.validate(testData).valid).toBe(true);
      expect(csvHandler.validate([]).valid).toBe(false); // Empty array check
      expect(csvHandler.validate("string").valid).toBe(false);
    });

    it('should detect valid CSV', () => {
      expect(csvHandler.canHandle('id,name\n1,Alice')).toBe(true);
    });
  });
});
