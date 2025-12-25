/**
 * JSON Format Handler
 * Handles JSON import/export with validation
 */
/**
 * JSON Handler
 */
export declare const jsonHandler: {
    /**
     * Export data to JSON string
     */
    export(data: any, options?: {}): Promise<string>;
    /**
     * Export data to stream (for large datasets)
     */
    exportStream(data: any, options: {}, writeStream: any): Promise<unknown>;
    /**
     * Import data from JSON string
     */
    import(content: any): Promise<any>;
    /**
     * Import data from stream (for large files)
     */
    importStream(readStream: any): Promise<any>;
    /**
     * Validate data
     */
    validate(data: any): {
        valid: boolean;
        error?: undefined;
    } | {
        valid: boolean;
        error: string;
    };
    /**
     * Check if handler can handle this content
     */
    canHandle(content: any): boolean;
};
export default jsonHandler;
