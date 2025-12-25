import { IPC_CHANNELS } from '../../../common/constants.ts';
/**
 * Dialog IPC handlers
 */
/**
 * Open file dialog and read content
 */
export declare function openFileDialogHandler(): (event: any, { options }?: {
    options?: {};
}) => Promise<{
    success: boolean;
    error: any;
    code: string;
} | {
    canceled: boolean;
    filePath?: undefined;
    content?: undefined;
    error?: undefined;
} | {
    canceled: boolean;
    filePath: string;
    content: string;
    error?: undefined;
} | {
    canceled: boolean;
    error: any;
    filePath?: undefined;
    content?: undefined;
}>;
/**
 * Save file dialog and write content
 */
export declare function saveFileDialogHandler(): (event: any, { options, content }: {
    options?: {};
    content: any;
}) => Promise<{
    success: boolean;
    error: any;
    code: string;
} | {
    canceled: boolean;
    filePath?: undefined;
    error?: undefined;
} | {
    canceled: boolean;
    filePath: string;
    error?: undefined;
} | {
    canceled: boolean;
    error: any;
    filePath?: undefined;
}>;
/**
 * Show message dialog
 */
export declare function messageDialogHandler(): (event: any, { options }: {
    options: any;
}) => Promise<{
    success: boolean;
    error: any;
    code: string;
} | {
    response: number;
}>;
/**
 * Show error dialog
 */
export declare function errorDialogHandler(): (event: any, { title, content }: {
    title: any;
    content: any;
}) => Promise<{
    success: boolean;
}>;
/**
 * Create all dialog handlers
 * @returns {Object} Handlers keyed by channel
 */
export declare function createDialogHandlers(): {
    [IPC_CHANNELS.DIALOG_OPEN_FILE]: (event: any, { options }?: {
        options?: {};
    }) => Promise<{
        success: boolean;
        error: any;
        code: string;
    } | {
        canceled: boolean;
        filePath?: undefined;
        content?: undefined;
        error?: undefined;
    } | {
        canceled: boolean;
        filePath: string;
        content: string;
        error?: undefined;
    } | {
        canceled: boolean;
        error: any;
        filePath?: undefined;
        content?: undefined;
    }>;
    [IPC_CHANNELS.DIALOG_SAVE_FILE]: (event: any, { options, content }: {
        options?: {};
        content: any;
    }) => Promise<{
        success: boolean;
        error: any;
        code: string;
    } | {
        canceled: boolean;
        filePath?: undefined;
        error?: undefined;
    } | {
        canceled: boolean;
        filePath: string;
        error?: undefined;
    } | {
        canceled: boolean;
        error: any;
        filePath?: undefined;
    }>;
    [IPC_CHANNELS.DIALOG_MESSAGE]: (event: any, { options }: {
        options: any;
    }) => Promise<{
        success: boolean;
        error: any;
        code: string;
    } | {
        response: number;
    }>;
    [IPC_CHANNELS.DIALOG_ERROR]: (event: any, { title, content }: {
        title: any;
        content: any;
    }) => Promise<{
        success: boolean;
    }>;
};
