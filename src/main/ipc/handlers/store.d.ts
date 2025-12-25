import Store from 'electron-store';
import { IPC_CHANNELS } from '../../../common/constants.ts';
export declare const store: Store<{
    appearance: {
        theme: string;
        density: string;
    };
    history: {
        maxStackSize: number;
    };
    language: string;
    hasCompletedTour: boolean;
}>;
/**
 * Store IPC handlers
 */
/**
 * Get value from store
 */
export declare function getStoreHandler(): (event: any, { key }: {
    key: any;
}) => Promise<{
    success: boolean;
    error: any;
    code: string;
} | {
    value: any;
}>;
/**
 * Set value in store
 */
export declare function setStoreHandler(): (event: any, { key, value }: {
    key: any;
    value: any;
}) => Promise<{
    success: boolean;
}>;
/**
 * Delete value from store
 */
export declare function deleteStoreHandler(): (event: any, { key }: {
    key: any;
}) => Promise<{
    success: boolean;
}>;
/**
 * Clear store
 */
export declare function clearStoreHandler(): () => Promise<{
    success: boolean;
}>;
/**
 * Check if key exists in store
 */
export declare function hasStoreHandler(): (event: any, { key }: {
    key: any;
}) => Promise<{
    success: boolean;
    error: any;
    code: string;
} | {
    exists: boolean;
}>;
/**
 * Create all store handlers
 * @returns {Object} Handlers keyed by channel
 */
export declare function createStoreHandlers(): {
    [IPC_CHANNELS.STORE_GET]: (event: any, { key }: {
        key: any;
    }) => Promise<{
        success: boolean;
        error: any;
        code: string;
    } | {
        value: any;
    }>;
    [IPC_CHANNELS.STORE_SET]: (event: any, { key, value }: {
        key: any;
        value: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.STORE_DELETE]: (event: any, { key }: {
        key: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.STORE_CLEAR]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.STORE_HAS]: (event: any, { key }: {
        key: any;
    }) => Promise<{
        success: boolean;
        error: any;
        code: string;
    } | {
        exists: boolean;
    }>;
};
