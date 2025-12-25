/**
 * Import/Export Manager
 * Handles data portability in multiple formats
 */
/**
 * ImportExportManager Class
 * Manages format handlers and data transformation
 */
export declare class ImportExportManager {
    constructor();
    /**
     * Register an export preset
     * @param {string} name - Preset name
     * @param {function} dataProvider - Async function returning data to export
     */
    registerPreset(name: any, dataProvider: any): void;
    /**
     * Execute export using a preset
     * @param {string} filePath - Destination path
     * @param {string} presetName - Name of the preset
     * @param {object} options - Export options
     */
    exportPreset(filePath: any, presetName: any, options?: {}): Promise<{
        success: boolean;
        path: any;
        format: any;
        size: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        path?: undefined;
        format?: undefined;
        size?: undefined;
    }>;
    /**
     * Register a format handler
     * @param {string} format - Format name (json, csv, md)
     * @param {object} handler - Handler object with export/import methods
     */
    registerHandler(format: any, handler: any): void;
    /**
     * Get handler for format
     */
    getHandler(format: any): any;
    /**
     * Auto-detect format from file extension
     */
    detectFormat(filePath: any): any;
    /**
     * Export data to file
     * @param {string} filePath - Destination file path
     * @param {any} data - Data to export
     * @param {object} options - Export options
     * @returns {Promise<object>} Result
     */
    export(filePath: any, data: any, options?: {}): Promise<{
        success: boolean;
        path: any;
        format: any;
        size: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        path?: undefined;
        format?: undefined;
        size?: undefined;
    }>;
    /**
     * Import data from file
     * @param {string} filePath - Source file path
     * @param {object} options - Import options (including onProgress)
     * @returns {Promise<object>} Result with data
     */
    import(filePath: any, options?: {}): Promise<{
        success: boolean;
        data: any;
        format: any;
        path: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
        format?: undefined;
        path?: undefined;
    }>;
    /**
     * Convert file from one format to another
     * @param {string} sourcePath - Source file path
     * @param {string} targetPath - Destination file path
     * @param {object} options - Conversion options (fromFormat, toFormat)
     * @returns {Promise<object>} Result
     */
    convert(sourcePath: any, targetPath: any, options?: {}): Promise<{
        success: boolean;
        sourceStart: any;
        targetPath: any;
        fromFormat: any;
        toFormat: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        sourceStart?: undefined;
        targetPath?: undefined;
        fromFormat?: undefined;
        toFormat?: undefined;
    }>;
    /**
     * List available presets
     */
    listPresets(): unknown[];
    /**
     * List available formats
     */
    listFormats(): unknown[];
}
declare const importExportManager: ImportExportManager;
export default importExportManager;
