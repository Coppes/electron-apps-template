/**
 * Markdown Format Handler
 * Handles Markdown import/export (optional)
 */
/**
 * Markdown Handler
 */
export declare const markdownHandler: {
    /**
     * Export data to Markdown string
     */
    export(data: any, options?: {}): Promise<string>;
    /**
     * Export data to stream (for large datasets)
     */
    exportStream(data: any, options: {}, writeStream: any): Promise<unknown>;
    /**
     * Import data from Markdown string
     */
    import(content: any, options?: {}): Promise<{
        content: any;
        parsed: string | Promise<string> | import("marked").TokensList;
        type: string;
    }>;
    /**
     * Import data from stream (for large files)
     */
    importStream(readStream: any, options?: {}): Promise<any>;
    /**
     * Validate data
     */
    validate(_data: any): {
        valid: boolean;
    };
    /**
     * Check if handler can handle this content
     */
    canHandle(content: any): boolean;
};
export default markdownHandler;
