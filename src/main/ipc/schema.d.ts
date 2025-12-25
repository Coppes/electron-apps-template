import { IPC_CHANNELS } from '../../common/constants.ts';
/**
 * IPC Schema definitions for type-safe communication
 * Each channel includes input/output validation schemas
 */
/**
 * Window management handlers
 */
export declare const windowSchema: {
    [IPC_CHANNELS.WINDOW_CREATE]: {
        input: {
            type: {
                type: string;
                required: boolean;
            };
            options: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            windowId: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.WINDOW_CLOSE]: {
        input: {
            windowId: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.WINDOW_MINIMIZE]: {
        input: {
            windowId: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.WINDOW_MAXIMIZE]: {
        input: {
            windowId: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.WINDOW_GET_STATE]: {
        input: {
            windowId: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            state: {
                type: string;
                required: boolean;
            };
        };
    };
    'window:get-display': {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            display: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * Progress handlers
 */
export declare const progressSchema: {
    [IPC_CHANNELS.PROGRESS_SET]: {
        input: {
            value: {
                type: string;
                required: boolean;
            };
            windowId: {
                type: string;
                required: boolean;
            };
            state: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.PROGRESS_CLEAR]: {
        input: {
            windowId: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * Store/persistence handlers
 */
export declare const storeSchema: {
    [IPC_CHANNELS.STORE_GET]: {
        input: {
            key: {
                type: string;
                required: boolean;
            };
        };
        output: {
            value: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.STORE_SET]: {
        input: {
            key: {
                type: string;
                required: boolean;
            };
            value: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.STORE_DELETE]: {
        input: {
            key: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.STORE_CLEAR]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.STORE_HAS]: {
        input: {
            key: {
                type: string;
                required: boolean;
            };
        };
        output: {
            exists: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * Dialog handlers
 */
export declare const dialogSchema: {
    [IPC_CHANNELS.DIALOG_OPEN_FILE]: {
        input: {
            options: {
                type: string;
                required: boolean;
            };
        };
        output: {
            canceled: {
                type: string;
                required: boolean;
            };
            filePath: {
                type: string;
                required: boolean;
            };
            content: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.DIALOG_SAVE_FILE]: {
        input: {
            options: {
                type: string;
                required: boolean;
            };
            content: {
                type: string;
                required: boolean;
            };
        };
        output: {
            canceled: {
                type: string;
                required: boolean;
            };
            filePath: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.DIALOG_MESSAGE]: {
        input: {
            options: {
                type: string;
                required: boolean;
            };
        };
        output: {
            response: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.DIALOG_ERROR]: {
        input: {
            title: {
                type: string;
                required: boolean;
            };
            content: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * App info handlers
 */
export declare const appSchema: {
    [IPC_CHANNELS.APP_GET_VERSION]: {
        input: {};
        output: {
            electron: {
                type: string;
                required: boolean;
            };
            chrome: {
                type: string;
                required: boolean;
            };
            node: {
                type: string;
                required: boolean;
            };
            v8: {
                type: string;
                required: boolean;
            };
            app: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.APP_GET_PATH]: {
        input: {
            name: {
                type: string;
                required: boolean;
            };
        };
        output: {
            path: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.APP_QUIT]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.APP_RELAUNCH]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    'app:is-packaged': {
        input: {};
        output: {
            isPackaged: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * Secure Store (Encrypted Storage) handlers
 */
export declare const secureStoreSchema: {
    [IPC_CHANNELS.SECURE_STORE_SET]: {
        input: {
            key: {
                type: string;
                required: boolean;
            };
            value: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.SECURE_STORE_GET]: {
        input: {
            key: {
                type: string;
                required: boolean;
            };
        };
        output: {
            value: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.SECURE_STORE_DELETE]: {
        input: {
            key: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.SECURE_STORE_HAS]: {
        input: {
            key: {
                type: string;
                required: boolean;
            };
        };
        output: {
            exists: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.SECURE_STORE_IS_AVAILABLE]: {
        input: {};
        output: {
            available: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * System handlers
 */
export declare const systemSchema: {
    [IPC_CHANNELS.SYSTEM_GET_PLATFORM]: {
        input: {};
        output: {
            platform: {
                type: string;
                required: boolean;
            };
            arch: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * File operation handlers
 */
export declare const fileSchema: {
    [IPC_CHANNELS.FILE_DROP]: {
        input: {
            filePaths: {
                type: string;
                required: boolean;
            };
            options: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            validFiles: {
                type: string;
                required: boolean;
            };
            invalidFiles: {
                type: string;
                required: boolean;
            };
            total: {
                type: string;
                required: boolean;
            };
            valid: {
                type: string;
                required: boolean;
            };
            invalid: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.FILE_DRAG_START]: {
        input: {
            filePath: {
                type: string;
                required: boolean;
            };
            icon: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            file: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.FILE_VALIDATE_PATH]: {
        input: {
            filePath: {
                type: string;
                required: boolean;
            };
            options: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            metadata: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.FILE_WATCH_START]: {
        input: {
            filePath: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            path: {
                type: string;
                required: boolean;
            };
            metadata: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.FILE_WATCH_STOP]: {
        input: {
            filePath: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            path: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * Data management handlers
 */
export declare const dataSchema: {
    [IPC_CHANNELS.DATA_CREATE_BACKUP]: {
        input: {
            type: {
                type: string;
                required: boolean;
            };
            includeDatabase: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            backup: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.DATA_LIST_BACKUPS]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            backups: {
                type: string;
                required: boolean;
            };
            total: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.DATA_RESTORE_BACKUP]: {
        input: {
            filename: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            message: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.DATA_DELETE_BACKUP]: {
        input: {
            filename: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            deleted: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.DATA_IMPORT]: {
        input: {
            filePath: {
                type: string;
                required: boolean;
            };
            options: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            data: {
                type: string;
                required: boolean;
            };
            format: {
                type: string;
                required: boolean;
            };
            path: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.DATA_EXPORT]: {
        input: {
            filePath: {
                type: string;
                required: boolean;
            };
            data: {
                type: string;
                required: boolean;
            };
            preset: {
                type: string;
                required: boolean;
            };
            options: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            path: {
                type: string;
                required: boolean;
            };
            format: {
                type: string;
                required: boolean;
            };
            size: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.DATA_LIST_FORMATS]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            formats: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.CONNECTIVITY_STATUS]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            online: {
                type: string;
                required: boolean;
            };
            checkUrl: {
                type: string;
                required: boolean;
            };
            lastCheck: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.SYNC_QUEUE_ADD]: {
        input: {
            operation: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            id: {
                type: string;
                required: boolean;
            };
            queued: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.SYNC_QUEUE_PROCESS]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            processed: {
                type: string;
                required: boolean;
            };
            failed: {
                type: string;
                required: boolean;
            };
            pending: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.SYNC_QUEUE_STATUS]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            total: {
                type: string;
                required: boolean;
            };
            pending: {
                type: string;
                required: boolean;
            };
            syncing: {
                type: string;
                required: boolean;
            };
            synced: {
                type: string;
                required: boolean;
            };
            failed: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    'data:validate-backup': {
        input: {
            filename: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            isValid: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * Tray handlers
 */
export declare const traySchema: {
    [IPC_CHANNELS.TRAY_CREATE]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.TRAY_DESTROY]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.TRAY_CHECK_STATUS]: {
        input: {};
        output: {
            created: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.TRAY_SHOW]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.TRAY_HIDE]: {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.TRAY_SET_ICON]: {
        input: {
            iconPath: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.TRAY_SET_TOOLTIP]: {
        input: {
            tooltip: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.TRAY_SET_MENU]: {
        input: {
            menuTemplate: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    'tray:set-status': {
        input: {
            status: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * Dock handlers
 */
export declare const dockSchema: {
    'dock:set-badge': {
        input: {
            text: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    'dock:set-menu': {
        input: {
            template: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * Notification handlers
 */
export declare const notificationSchema: {
    [IPC_CHANNELS.NOTIFICATION_SHOW]: {
        input: {
            title: {
                type: string;
                required: boolean;
            };
            body: {
                type: string;
                required: boolean;
            };
            icon: {
                type: string;
                required: boolean;
            };
            silent: {
                type: string;
                required: boolean;
            };
            urgency: {
                type: string;
                required: boolean;
            };
            timeoutType: {
                type: string;
                required: boolean;
            };
            timeoutMs: {
                type: string;
                required: boolean;
            };
            actions: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            id: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.NOTIFICATION_CLOSE]: {
        input: {
            id: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.NOTIFICATION_GET_HISTORY]: {
        input: {
            limit: {
                type: string;
                required: boolean;
            };
        };
        output: {
            history: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.NOTIFICATION_CHECK_PERMISSION]: {
        input: {};
        output: {
            allowed: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.NOTIFICATION_REQUEST_PERMISSION]: {
        input: {};
        output: {
            granted: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * i18n handlers
 */
export declare const i18nSchema: {
    [IPC_CHANNELS.I18N_SET_LANGUAGE]: {
        input: {
            language: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    [IPC_CHANNELS.I18N_GET_LANGUAGE]: {
        input: {};
        output: {
            language: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * Plugin handlers
 */
export declare const pluginsSchema: {
    'plugins:get-all': {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            plugins: {
                type: string;
                required: boolean;
            };
        };
    };
};
/**
 * Combined schema export
 */
export declare const ipcSchema: {
    'dock:set-badge': {
        input: {
            text: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    'dock:set-menu': {
        input: {
            template: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
        };
    };
    'plugins:get-all': {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            plugins: {
                type: string;
                required: boolean;
            };
        };
    };
    'tray:set-status': {
        input: {
            status: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    'data:validate-backup': {
        input: {
            filename: {
                type: string;
                required: boolean;
            };
        };
        output: {
            success: {
                type: string;
                required: boolean;
            };
            isValid: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
    'app:is-packaged': {
        input: {};
        output: {
            isPackaged: {
                type: string;
                required: boolean;
            };
        };
    };
    'window:get-display': {
        input: {};
        output: {
            success: {
                type: string;
                required: boolean;
            };
            display: {
                type: string;
                required: boolean;
            };
            error: {
                type: string;
                required: boolean;
            };
        };
    };
};
