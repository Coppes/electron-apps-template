/**
 * File Operations IPC Handlers
 * Handles drag-and-drop, file validation, and file watching
 */
import { IPC_CHANNELS } from '../../../common/constants.ts';
/**
 * Validate file path for security (wrapper for centralized security module)
 * Prevents path traversal, checks extensions and size limits
 * @param {string} filePath - Path to validate
 * @param {object} options - Validation options
 * @returns {Promise<{valid: boolean, error?: string, metadata?: object}>}
 */
export declare function validateFilePath(filePath: any, options?: {}): Promise<{
    valid: boolean;
    error: string;
    code: string;
    allowedExtensions?: undefined;
    resolvedPath?: undefined;
    normalizedPath?: undefined;
    extension?: undefined;
    maxSize?: undefined;
} | {
    valid: boolean;
    error: string;
    code: string;
    allowedExtensions: any;
    resolvedPath?: undefined;
    normalizedPath?: undefined;
    extension?: undefined;
    maxSize?: undefined;
} | {
    valid: boolean;
    resolvedPath: string;
    normalizedPath: string;
    extension: string;
    maxSize: any;
    error?: undefined;
    code?: undefined;
    allowedExtensions?: undefined;
} | {
    valid: boolean;
    metadata: {
        path: string;
        name: string;
        extension: string;
        size: number;
        modified: Date;
    };
} | {
    valid: boolean;
    metadata: {
        path: string;
        name: string;
        extension: string;
        size?: undefined;
        modified?: undefined;
    };
}>;
/**
 * Handle file drop operation
 */
export declare function handleFileDrop(event: any, payload: any): Promise<{
    success: boolean;
    error: string;
    code: string;
    validFiles?: undefined;
    invalidFiles?: undefined;
    total?: undefined;
    valid?: undefined;
    invalid?: undefined;
} | {
    success: boolean;
    error: string;
    code?: undefined;
    validFiles?: undefined;
    invalidFiles?: undefined;
    total?: undefined;
    valid?: undefined;
    invalid?: undefined;
} | {
    success: boolean;
    validFiles: any[];
    invalidFiles: {
        path: any;
        error: any;
    }[];
    total: number;
    valid: number;
    invalid: number;
    error?: undefined;
    code?: undefined;
}>;
/**
 * Handle drag start operation (drag from app to desktop)
 */
export declare function handleDragStart(event: any, payload: any): Promise<{
    success: boolean;
    error: any;
    file?: undefined;
} | {
    success: boolean;
    file: any;
    error?: undefined;
}>;
/**
 * Handle file path validation request (IPC handler)
 */
export declare function handleValidateFilePath(event: any, payload: any): Promise<{
    success: boolean;
    error: string;
    metadata?: undefined;
} | {
    success: boolean;
    error: any;
    metadata: any;
}>;
/**
 * Handle file watch start request
 */
export declare function handleFileWatchStart(event: any, payload: any): Promise<{
    success: boolean;
    message: string;
    path: string;
    metadata?: undefined;
    error?: undefined;
} | {
    success: boolean;
    path: string;
    metadata: {
        size: number;
        mtime: number;
        isDirectory: boolean;
        exists: boolean;
    };
    message?: undefined;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    message?: undefined;
    path?: undefined;
    metadata?: undefined;
}>;
/**
 * Handle file watch stop request
 */
export declare function handleFileWatchStop(event: any, payload: any): Promise<{
    success: boolean;
    message: string;
    path?: undefined;
    error?: undefined;
} | {
    success: boolean;
    path: string;
    message?: undefined;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    message?: undefined;
    path?: undefined;
}>;
export declare const fileHandlers: {
    [IPC_CHANNELS.FILE_DROP]: typeof handleFileDrop;
    [IPC_CHANNELS.FILE_DRAG_START]: typeof handleDragStart;
    [IPC_CHANNELS.FILE_VALIDATE_PATH]: typeof handleValidateFilePath;
    [IPC_CHANNELS.FILE_WATCH_START]: typeof handleFileWatchStart;
    [IPC_CHANNELS.FILE_WATCH_STOP]: typeof handleFileWatchStop;
};
export default fileHandlers;
