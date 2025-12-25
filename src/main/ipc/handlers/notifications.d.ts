import { IPC_CHANNELS } from '../../../common/constants.ts';
/**
 * Native Notifications IPC Handlers
 */
/**
 * Create notification IPC handlers
 * @returns {Object} Handler map
 */
export declare function createNotificationHandlers(): {
    [IPC_CHANNELS.NOTIFICATION_SHOW]: (event: any, options: any) => Promise<{
        success: boolean;
        id: string;
    }>;
    [IPC_CHANNELS.NOTIFICATION_CLOSE]: (event: any, { id }: {
        id: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.NOTIFICATION_GET_HISTORY]: (event: any, { limit }: {
        limit: any;
    }) => Promise<{
        history: any;
    }>;
    [IPC_CHANNELS.NOTIFICATION_CHECK_PERMISSION]: () => Promise<{
        allowed: boolean;
    }>;
    [IPC_CHANNELS.NOTIFICATION_REQUEST_PERMISSION]: () => Promise<{
        granted: boolean;
    }>;
};
export declare const notificationHandlers: {
    [IPC_CHANNELS.NOTIFICATION_SHOW]: (event: any, options: any) => Promise<{
        success: boolean;
        id: string;
    }>;
    [IPC_CHANNELS.NOTIFICATION_CLOSE]: (event: any, { id }: {
        id: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.NOTIFICATION_GET_HISTORY]: (event: any, { limit }: {
        limit: any;
    }) => Promise<{
        history: any;
    }>;
    [IPC_CHANNELS.NOTIFICATION_CHECK_PERMISSION]: () => Promise<{
        allowed: boolean;
    }>;
    [IPC_CHANNELS.NOTIFICATION_REQUEST_PERMISSION]: () => Promise<{
        granted: boolean;
    }>;
};
