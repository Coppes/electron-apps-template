import path from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream, ReadStream, WriteStream } from 'fs';
import { logger } from '../logger.ts';
import jsonHandler from './format-handlers/json-handler.ts';
import csvHandler from './format-handlers/csv-handler.ts';
import markdownHandler from './format-handlers/markdown-handler.ts';

// File size thresholds
const STREAMING_THRESHOLD = 10 * 1024 * 1024; // 10MB - use streaming for files larger than this

export interface FormatHandler {
  validate(data: any): { valid: boolean; error?: string };
  export(data: any, options?: any): Promise<string | Buffer>;
  exportStream?(data: any, options: any, writeStream: WriteStream): Promise<void>;
  import(content: string, options?: any): Promise<any>;
  importStream?(readStream: ReadStream, options: any): Promise<any>;
}

export interface ExportPreset {
  (): Promise<any>;
}

export interface ProgressData {
  phase: 'start' | 'exporting' | 'importing' | 'complete';
  progress: number;
  bytes?: number;
  total?: number;
}

export interface ExportOptions {
  format?: string;
  onProgress?: (progress: ProgressData) => void;
  [key: string]: any;
}

export interface ImportOptions {
  format?: string;
  onProgress?: (progress: ProgressData) => void;
  [key: string]: any;
}

export interface ConversionOptions extends ImportOptions {
  fromFormat?: string;
  toFormat: string;
}

/**
 * ImportExportManager Class
 * Manages format handlers and data transformation
 */
export class ImportExportManager {
  private handlers: Map<string, FormatHandler>;
  private presets: Map<string, ExportPreset>;
  private maxFileSize: number;

  constructor() {
    this.handlers = new Map();
    this.presets = new Map();
    this.maxFileSize = 100 * 1024 * 1024; // 100MB default
  }

  /**
   * Register an export preset
   */
  registerPreset(name: string, dataProvider: ExportPreset): void {
    this.presets.set(name, dataProvider);
    logger.debug(`Registered export preset: ${name}`);
  }

  /**
   * Execute export using a preset
   */
  async exportPreset(filePath: string, presetName: string, options: ExportOptions = {}) {
    const dataProvider = this.presets.get(presetName);
    if (!dataProvider) {
      return {
        success: false,
        error: `Preset not found: ${presetName}`
      };
    }

    try {
      const data = await dataProvider();
      return this.export(filePath, data, options);
    } catch (error: any) {
      logger.error(`Failed to execute preset ${presetName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Register a format handler
   */
  registerHandler(format: string, handler: FormatHandler): void {
    this.handlers.set(format.toLowerCase(), handler);
    logger.debug(`Registered format handler: ${format}`);
  }

  /**
   * Get handler for format
   */
  getHandler(format: string): FormatHandler | undefined {
    return this.handlers.get(format.toLowerCase());
  }

  /**
   * Auto-detect format from file extension
   */
  detectFormat(filePath: string): string | null {
    const ext = path.extname(filePath).toLowerCase();
    const formatMap: Record<string, string> = {
      '.json': 'json',
      '.csv': 'csv',
      '.md': 'markdown',
      '.markdown': 'markdown'
    };
    return formatMap[ext] || null;
  }

  /**
   * Export data to file
   */
  async export(filePath: string, data: any, options: ExportOptions = {}) {
    try {
      const { format: specifiedFormat, onProgress, ...handlerOptions } = options;

      // Determine format
      const format = specifiedFormat || this.detectFormat(filePath);

      if (!format) {
        return {
          success: false,
          error: 'Could not determine format. Specify format option or use known extension.'
        };
      }

      // Get handler
      const handler = this.getHandler(format);

      if (!handler) {
        return {
          success: false,
          error: `No handler registered for format: ${format}`
        };
      }

      // Validate data
      if (handler.validate) {
        const validation = handler.validate(data);
        if (!validation.valid) {
          return {
            success: false,
            error: `Data validation failed: ${validation.error}`
          };
        }
      }

      if (onProgress) onProgress({ phase: 'start', progress: 0 });

      // Export data
      const exported = await handler.export(data, handlerOptions);

      // Use streaming for large exports
      if (exported.length > STREAMING_THRESHOLD && handler.exportStream) {
        await new Promise<void>((resolve, reject) => {
          const totalBytes = exported.length; // Approximate if string, precise if buffer

          if (onProgress) {
            // We can't easily hook into writeStream 'data' as it's writable.
            // We'd need to pipe through a Passthrough.
            // But handler.exportStream(data, options, writeStream) likely writes directly.
            // For now, simpler progress:
            if (totalBytes > 0) {
              onProgress({ phase: 'exporting', progress: 0, total: totalBytes });
            }
          }

          const writeStream = createWriteStream(filePath);
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);

          if (handler.exportStream) {
            handler.exportStream(data, handlerOptions, writeStream)
              .then(() => {
                if (onProgress) onProgress({ phase: 'exporting', progress: 100, bytes: totalBytes });
              })
              .catch(reject);
          } else {
            // Fallback if exportStream is missing but check passed (should not happen due to check above)
            reject(new Error('Export stream handler missing'));
          }
        });
      } else {
        // Write to file directly for small files
        // handle exported being buffer or string
        await fs.writeFile(filePath, exported);
        if (onProgress) onProgress({ phase: 'exporting', progress: 100, bytes: exported.length });
      }

      if (onProgress) onProgress({ phase: 'complete', progress: 100 });

      logger.info(`Data exported to ${filePath} (${format})`);

      return {
        success: true,
        path: filePath,
        format,
        size: exported.length
      };
    } catch (error: any) {
      logger.error('Export failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Import data from file
   */
  async import(filePath: string, options: ImportOptions = {}) {
    try {
      const { onProgress } = options;

      // Check file exists
      const stats = await fs.stat(filePath);
      const totalSize = stats.size;

      // Check file size
      if (totalSize > this.maxFileSize) {
        return {
          success: false,
          error: `File too large (${totalSize} bytes). Maximum: ${this.maxFileSize} bytes`
        };
      }

      // Determine format
      const { format: specifiedFormat, ...handlerOptions } = options;
      const format = specifiedFormat || this.detectFormat(filePath);

      if (!format) {
        return {
          success: false,
          error: 'Could not determine format. Specify format option.'
        };
      }

      // Get handler
      const handler = this.getHandler(format);

      if (!handler) {
        return {
          success: false,
          error: `No handler registered for format: ${format}`
        };
      }

      if (onProgress) onProgress({ phase: 'start', progress: 0, total: totalSize });

      // Use streaming for large files
      let data;
      if (totalSize > STREAMING_THRESHOLD && handler.importStream) {
        data = await new Promise((resolve, reject) => {
          const readStream = createReadStream(filePath, 'utf8');

          let bytesRead = 0;
          if (onProgress) {
            readStream.on('data', (chunk) => {
              bytesRead += chunk.length;
              onProgress({
                phase: 'importing',
                progress: Math.min(100, Math.round((bytesRead / totalSize) * 100)),
                bytes: bytesRead,
                total: totalSize
              });
            });
          }

          if (handler.importStream) {
            handler.importStream(readStream, handlerOptions)
              .then(resolve)
              .catch(reject);
          }
        });
      } else {
        // Read file directly for small files
        const content = await fs.readFile(filePath, 'utf8');
        if (onProgress) onProgress({ phase: 'importing', progress: 100, bytes: content.length, total: totalSize });
        data = await handler.import(content, handlerOptions);
      }

      if (onProgress) onProgress({ phase: 'complete', progress: 100 });

      logger.info(`Data imported from ${filePath} (${format})`);

      return {
        success: true,
        data,
        format,
        path: filePath
      };
    } catch (error: any) {
      logger.error('Import failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convert file from one format to another
   */
  async convert(sourcePath: string, targetPath: string, options: ConversionOptions = { toFormat: 'json' }) {
    try {
      const { fromFormat, toFormat, ...otherOptions } = options;

      // 1. Import data
      const importResult = await this.import(sourcePath, { format: fromFormat, ...otherOptions });

      if (!importResult.success) {
        return {
          success: false,
          error: `Conversion failed at import step: ${importResult.error}`
        };
      }

      // 2. Transform/Prepare data (optional hooks could go here)
      // For now, pass import data directly to export
      // Note: Markdown import returns wrapper object, checking if unwrapping is needed
      const dataToExport = importResult.data;

      // If we are exporting to CSV, we generally expect an array of objects.
      // If the imported data is not an array, this might fail in the handler.
      // We rely on the export handler validation.

      // 3. Export data
      const exportResult = await this.export(targetPath, dataToExport, { format: toFormat, ...otherOptions });

      if (!exportResult.success) {
        return {
          success: false,
          error: `Conversion failed at export step: ${exportResult.error}`
        };
      }

      logger.info(`Converted ${sourcePath} (${importResult.format}) to ${targetPath} (${exportResult.format})`);

      return {
        success: true,
        sourceStart: sourcePath,
        targetPath,
        fromFormat: importResult.format,
        toFormat: exportResult.format
      };
    } catch (error: any) {
      logger.error('Conversion failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List available presets
   */
  listPresets(): string[] {
    return Array.from(this.presets.keys());
  }

  /**
   * List available formats
   */
  listFormats(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// Create singleton instance
const importExportManager = new ImportExportManager();

// Register built-in handlers
// handlers need to implement FormatHandler interface which I'm sure they do not strictly yet (any), but that's ok for now
importExportManager.registerHandler('json', jsonHandler);
importExportManager.registerHandler('csv', csvHandler);
importExportManager.registerHandler('markdown', markdownHandler);

// Register default presets
import Store from 'electron-store';
const store = new Store({ name: 'config' });

// Preset: Export all settings
importExportManager.registerPreset('settings', async () => {
  return store.store;
});

// Preset: Export Documents (Example)
importExportManager.registerPreset('documents', async () => {
  // This would typically query a database or file system
  // For now, return a placeholder structure
  // const data = []; // Assuming 'data' would come from a database query or file system read
  // const dataToExport = {
  //   version: '1.0.0',
  //   timestamp: new Date().toISOString(),
  //   data: data
  // };
  return {
    documents: [],
    metadata: {
      exportedAt: new Date().toISOString(),
      count: 0
    }
  };
});

export default importExportManager;
