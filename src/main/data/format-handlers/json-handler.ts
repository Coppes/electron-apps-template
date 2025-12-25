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
  async export(data: any, options: any = {}): Promise<string> {
    const { pretty = true } = options;
    return JSON.stringify(data, null, pretty ? 2 : 0);
  },

  /**
   * Export data to stream (for large datasets)
   */
  async exportStream(data: any, options: any = {}, writeStream: any): Promise<void> {
    const { pretty = true } = options;
    const jsonString = JSON.stringify(data, null, pretty ? 2 : 0);

    return new Promise<void>((resolve, reject) => {
      writeStream.write(jsonString, (error: Error | null | undefined) => {
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
  async import(content: string) {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON: ${(error as any).message}`);
    }
  },

  /**
   * Import data from stream (for large files)
   */
  async importStream(readStream: any) {
    const chunks: Buffer[] = [];

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
  validate(data: any) {
    try {
      // Check if data is serializable
      JSON.stringify(data);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Data is not JSON serializable: ${(error as any).message}`
      };
    }
  },

  /**
   * Check if handler can handle this content
   */
  canHandle(content: string) {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }
};

export default jsonHandler;
