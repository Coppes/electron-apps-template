/**
 * Markdown Format Handler
 * Handles Markdown import/export (optional)
 */

import { marked } from 'marked';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

/**
 * Markdown Handler
 */
export const markdownHandler = {
  /**
   * Export data to Markdown string
   */
  async export(data, options = {}) {
    const { includeMetadata = true } = options;

    let markdown = '';

    // Add metadata header if requested
    if (includeMetadata && typeof data === 'object' && data.metadata) {
      markdown += '---\n';
      for (const [key, value] of Object.entries(data.metadata)) {
        markdown += `${key}: ${value}\n`;
      }
      markdown += '---\n\n';
    }

    // Handle different data types
    if (typeof data === 'string') {
      markdown += data;
    } else if (Array.isArray(data)) {
      // Convert array to list
      for (const item of data) {
        if (typeof item === 'object') {
          markdown += `- **${item.title || item.name || 'Item'}**\n`;
          if (item.description) {
            markdown += `  ${item.description}\n`;
          }
        } else {
          markdown += `- ${item}\n`;
        }
      }
    } else if (typeof data === 'object') {
      // Convert object to sections
      for (const [key, value] of Object.entries(data)) {
        if (key === 'metadata') continue; // Skip metadata (already handled)

        markdown += `## ${key}\n\n`;

        if (typeof value === 'string') {
          markdown += `${value}\n\n`;
        } else if (Array.isArray(value)) {
          for (const item of value) {
            markdown += `- ${typeof item === 'object' ? JSON.stringify(item) : item}\n`;
          }
          markdown += '\n';
        } else if (typeof value === 'object') {
          markdown += '```json\n';
          markdown += JSON.stringify(value, null, 2);
          markdown += '\n```\n\n';
        } else {
          markdown += `${value}\n\n`;
        }
      }
    }

    return markdown;
  },

  /**
   * Export data to stream (for large datasets)
   */
  async exportStream(data, options = {}, writeStream) {
    const markdown = await this.export(data, options);

    return new Promise((resolve, reject) => {
      writeStream.write(markdown, (error) => {
        if (error) reject(error);
        else {
          writeStream.end();
          resolve();
        }
      });
    });
  },

  /**
   * Import data from Markdown string
   */
  async import(content, options = {}) {
    const { parseHtml = true } = options;

    try {
      // Parse markdown to HTML or tokens
      const parsed = parseHtml ? marked(content) : marked.lexer(content);

      return {
        content,
        parsed,
        type: 'markdown'
      };
    } catch (error) {
      throw new Error(`Invalid Markdown: ${error.message}`);
    }
  },

  /**
   * Import data from stream (for large files)
   */
  async importStream(readStream, options = {}) {
    const chunks = [];

    const collectTransform = new Transform({
      transform(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });

    await pipeline(readStream, collectTransform);

    const content = Buffer.concat(chunks).toString('utf8');
    return this.import(content, options);
  },

  /**
   * Validate data
   */
  validate(_data) {
    // Markdown is flexible, most data can be converted
    return { valid: true };
  },

  /**
   * Check if handler can handle this content
   */
  canHandle(content) {
    // Basic markdown detection (headers, lists, links)
    const markdownPatterns = [
      /^#{1,6}\s/m,        // Headers
      /^(\s*)(\*|\+|-)\s/gm, // Normalize list methods
      /^\d+\.\s/m,         // Ordered list
      /\[.*\]\(.*\)/,      // Links
      /\*\*.*\*\*/,        // Bold
      /_.*_/               // Italic
    ];

    return markdownPatterns.some(pattern => pattern.test(content));
  }
};

export default markdownHandler;
