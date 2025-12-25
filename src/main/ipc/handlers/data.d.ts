/**
 * Data Management IPC Handlers
 * Handles backup/restore and import/export operations
 */
import { IPC_CHANNELS } from '../../../common/constants.ts';
/**
 * Handle create backup request
 */
export declare function handleCreateBackup(event: any, payload: any): Promise<{
    success: boolean;
    backup: any;
} | {
    success: boolean;
    error: string;
    code: string;
} | {
    success: boolean;
    error: any;
    code?: undefined;
}>;
/**
 * Handle list backups request
 */
export declare function handleListBackups(): Promise<{
    success: boolean;
    backups: any[];
    total: number;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    backups: any[];
    total?: undefined;
}>;
/**
 * Handle restore backup request
 */
export declare function handleRestoreBackup(event: any, payload: any): Promise<{
    success: boolean;
    message: string;
    backup: any;
} | {
    success: boolean;
    error: any;
}>;
/**
 * Handle delete backup request
 */
export declare function handleDeleteBackup(event: any, payload: any): Promise<{
    success: boolean;
    deleted: any;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    deleted?: undefined;
}>;
/**
 * Handle data import request
 */
export declare function handleDataImport(event: any, payload: any): Promise<{
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
} | {
    success: boolean;
    error: string;
    code: string;
}>;
/**
 * Handle data export request
 */
export declare function handleDataExport(event: any, payload: any): Promise<{
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
} | {
    success: boolean;
    error: string;
    code: string;
}>;
/**
 * Handle list formats request
 */
export declare function handleListFormats(): Promise<{
    success: boolean;
    formats: unknown[];
    error?: undefined;
} | {
    success: boolean;
    error: any;
    formats: any[];
}>;
/**
 * Handle connectivity status request
 */
export declare function handleConnectivityStatus(): Promise<{
    online: any;
    checkUrl: any;
    lastCheck: number;
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    online: boolean;
}>;
/**
 * Handle validate backup request
 */
export declare function handleValidateBackup(event: any, payload: any): Promise<{
    success: boolean;
    isValid: boolean;
    error: string;
} | {
    success: boolean;
    error: any;
    isValid?: undefined;
}>;
/**
 * Handle sync queue add request
 */
export declare function handleSyncQueueAdd(event: any, payload: any): Promise<{
    success: boolean;
    id: string;
    queued: any;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    id?: undefined;
    queued?: undefined;
}>;
/**
 * Handle sync queue process request
 */
export declare function handleSyncQueueProcess(): Promise<{
    success: boolean;
    message: string;
    processed?: undefined;
    failed?: undefined;
    pending?: undefined;
    error?: undefined;
} | {
    success: boolean;
    processed: number;
    failed: number;
    pending: any;
    message?: undefined;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    message?: undefined;
    processed?: undefined;
    failed?: undefined;
    pending?: undefined;
}>;
/**
 * Handle sync queue status request
 */
export declare function handleSyncQueueStatus(): Promise<{
    total: any;
    pending: number;
    syncing: number;
    synced: number;
    failed: number;
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: any;
}>;
export declare const dataHandlers: {
    [IPC_CHANNELS.DATA_CREATE_BACKUP]: typeof handleCreateBackup;
    [IPC_CHANNELS.DATA_LIST_BACKUPS]: typeof handleListBackups;
    [IPC_CHANNELS.DATA_RESTORE_BACKUP]: typeof handleRestoreBackup;
    [IPC_CHANNELS.DATA_DELETE_BACKUP]: typeof handleDeleteBackup;
    [IPC_CHANNELS.DATA_IMPORT]: typeof handleDataImport;
    [IPC_CHANNELS.DATA_EXPORT]: typeof handleDataExport;
    [IPC_CHANNELS.DATA_LIST_FORMATS]: typeof handleListFormats;
    [IPC_CHANNELS.CONNECTIVITY_STATUS]: typeof handleConnectivityStatus;
    [IPC_CHANNELS.SYNC_QUEUE_ADD]: typeof handleSyncQueueAdd;
    [IPC_CHANNELS.SYNC_QUEUE_PROCESS]: typeof handleSyncQueueProcess;
    [IPC_CHANNELS.SYNC_QUEUE_STATUS]: typeof handleSyncQueueStatus;
    'data:validate-backup': typeof handleValidateBackup;
};
export default dataHandlers;
