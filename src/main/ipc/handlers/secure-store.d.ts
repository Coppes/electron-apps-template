/**
 * Secure Store IPC Handlers
 *
 * Provides IPC handlers for encrypted storage operations using Electron's safeStorage API.
 */
import { IPC_CHANNELS } from '../../../common/constants.ts';
/**
 * Handle SECURE_STORE_SET - Encrypt and store a value
 * @param {Object} event - IPC event
 * @param {Object} payload - Request payload
 * @param {string} payload.key - Storage key
 * @param {any} payload.value - Value to encrypt and store
 * @returns {Object} Success response or error
 */
export declare function handleSecureStoreSet(event: any, payload: any): Promise<{
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: any;
}>;
/**
 * Handle SECURE_STORE_GET - Retrieve and decrypt a value
 * @param {Object} event - IPC event
 * @param {Object} payload - Request payload
 * @param {string} payload.key - Storage key
 * @returns {any} Decrypted value or null if not found
 */
export declare function handleSecureStoreGet(event: any, payload: any): Promise<any>;
/**
 * Handle SECURE_STORE_DELETE - Delete an encrypted value
 * @param {Object} event - IPC event
 * @param {Object} payload - Request payload
 * @param {string} payload.key - Storage key
 * @returns {Object} Success response
 */
export declare function handleSecureStoreDelete(event: any, payload: any): Promise<{
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: any;
}>;
/**
 * Handle SECURE_STORE_HAS - Check if an encrypted value exists
 * @param {Object} event - IPC event
 * @param {Object} payload - Request payload
 * @param {string} payload.key - Storage key
 * @returns {boolean} True if the key exists
 */
export declare function handleSecureStoreHas(event: any, payload: any): Promise<boolean>;
/**
 * Handle SECURE_STORE_IS_AVAILABLE - Check if encryption is available
 * @param {Object} _event - IPC event (unused)
 * @param {Object} _payload - Request payload (unused)
 * @returns {boolean} True if encryption is available
 */
export declare function handleSecureStoreIsAvailable(_event: any, _payload: any): Promise<any>;
export declare const secureStoreHandlers: {
    [IPC_CHANNELS.SECURE_STORE_SET]: typeof handleSecureStoreSet;
    [IPC_CHANNELS.SECURE_STORE_GET]: typeof handleSecureStoreGet;
    [IPC_CHANNELS.SECURE_STORE_DELETE]: typeof handleSecureStoreDelete;
    [IPC_CHANNELS.SECURE_STORE_HAS]: typeof handleSecureStoreHas;
    [IPC_CHANNELS.SECURE_STORE_IS_AVAILABLE]: typeof handleSecureStoreIsAvailable;
};
