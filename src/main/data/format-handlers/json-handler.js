/**
 * JSON Format Handler
 * Handles JSON import/export with validation
 */

import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

/**
 * JSON Handler
 */
export const jsonHandler = {
  /**
   * Export data to JSON string
   */
  async export(data, options = {}) {
    const { pretty = true } = options;
    return JSON.stringify(data, null, pretty ? 2 : 0);
  },

  /**
   * Export data to stream (for large datasets)
   */
  async exportStream(data, options = {}, writeStream) {
    const { pretty = true } = options;
    const jsonString = JSON.stringify(data, null, pretty ? 2 : 0);
    
    return new Promise((resolve, reject) => {
      writeStream.write(jsonString, (error) => {
        if (error) reject(error);
        else {
          writeStream.end();
          resolve();
        }
      });
    });
  },

  /**
   * Import data from JSON string
   */
  async import(content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  },

  /**
   * Import data from stream (for large files)
   */
  async importStream(readStream) {
    const chunks = [];
    
    const collectTransform = new Transform({
      transform(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });

    await pipeline(readStream, collectTransform);
    
    const content = Buffer.concat(chunks).toString('utf8');
    return JSON.parse(content);
  },

  /**
   * Validate data
   */
  validate(data) {
    try {
      // Check if data is serializable
      JSON.stringify(data);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Data is not JSON serializable: ${error.message}`
      };
    }
  },

  /**
   * Check if handler can handle this content
   */
  canHandle(content) {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }
};

export default jsonHandler;
