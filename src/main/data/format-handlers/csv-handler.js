/**
 * CSV Format Handler
 * Handles CSV import/export
 */

import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { parse as parseStream } from 'csv-parse';
import { stringify as stringifyStream } from 'csv-stringify';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

/**
 * CSV Handler
 */
export const csvHandler = {
  /**
   * Export data to CSV string
   */
  async export(data, options = {}) {
    const {
      headers = true,
      delimiter = ',',
      columns
    } = options;

    // Handle array of objects
    if (Array.isArray(data) && data.length > 0) {
      return stringify(data, {
        header: headers,
        columns: columns || Object.keys(data[0]),
        delimiter
      });
    }

    // Handle single object (convert to array)
    if (typeof data === 'object' && !Array.isArray(data)) {
      const rows = Object.entries(data).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : value
      }));

      return stringify(rows, {
        header: headers,
        columns: ['key', 'value'],
        delimiter
      });
    }

    throw new Error('Data must be an array of objects or a single object');
  },

  /**
   * Export data to stream (for large datasets)
   */
  async exportStream(data, options = {}, writeStream) {
    const {
      headers = true,
      delimiter = ',',
      columns
    } = options;

    // Handle array of objects
    if (!Array.isArray(data)) {
      throw new Error('Stream export requires array of objects');
    }

    const stringifier = stringifyStream({
      header: headers,
      columns: columns || (data.length > 0 ? Object.keys(data[0]) : []),
      delimiter
    });

    // Create a readable stream from array
    const { Readable } = await import('stream');
    const readable = Readable.from(data);

    await pipeline(readable, stringifier, writeStream);
  },

  /**
   * Import data from CSV string
   */
  async import(content, options = {}) {
    const {
      headers = true,
      delimiter = ',',
      skipEmptyLines = true
    } = options;

    try {
      const records = parse(content, {
        columns: headers,
        delimiter,
        skip_empty_lines: skipEmptyLines,
        trim: true
      });

      return records;
    } catch (error) {
      throw new Error(`Invalid CSV: ${error.message}`);
    }
  },

  /**
   * Import data from stream (for large files)
   */
  async importStream(readStream, options = {}) {
    const {
      headers = true,
      delimiter = ',',
      skipEmptyLines = true
    } = options;

    const records = [];
    const parser = parseStream({
      columns: headers,
      delimiter,
      skip_empty_lines: skipEmptyLines,
      trim: true
    });

    const collectTransform = new Transform({
      objectMode: true,
      transform(record, encoding, callback) {
        records.push(record);
        callback();
      }
    });

    await pipeline(readStream, parser, collectTransform);
    
    return records;
  },

  /**
   * Validate data
   */
  validate(data) {
    if (!Array.isArray(data) && typeof data !== 'object') {
      return {
        valid: false,
        error: 'Data must be an array or object'
      };
    }

    if (Array.isArray(data) && data.length === 0) {
      return {
        valid: false,
        error: 'Data array is empty'
      };
    }

    return { valid: true };
  },

  /**
   * Check if handler can handle this content
   */
  canHandle(content) {
    try {
      parse(content, { columns: true, to: 1 }); // Try parsing first row
      return true;
    } catch {
      return false;
    }
  }
};

export default csvHandler;
