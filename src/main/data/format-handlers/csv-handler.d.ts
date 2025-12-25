/**
 * CSV Format Handler
 * Handles CSV import/export
 */
/**
 * CSV Handler
 */
export declare const csvHandler: {
    /**
     * Export data to CSV string
     */
    export(data: any, options?: {}): Promise<string>;
    /**
     * Export data to stream (for large datasets)
     */
    exportStream(data: any, options: {}, writeStream: any): Promise<void>;
    /**
     * Import data from CSV string
     */
    import(content: any, options?: {}): Promise<any>;
    /**
     * Import data from stream (for large files)
     */
    importStream(readStream: any, options?: {}): Promise<any[]>;
    /**
     * Validate data
     */
    validate(data: any): {
        valid: boolean;
        error: string;
    } | {
        valid: boolean;
        error?: undefined;
    };
    /**
     * Check if handler can handle this content
     */
    canHandle(content: any): boolean;
};
export default csvHandler;
