/**
 * Encrypted Storage Module
 *
 * Provides secure storage for sensitive data using Electron's safeStorage API.
 * Data is encrypted using OS-level encryption mechanisms:
 * - macOS: Keychain
 * - Windows: DPAPI
 * - Linux: libsecret
 */
/**
 * Reset the encryption availability cache (for testing purposes)
 * @private
 */
export declare function _resetEncryptionCache(): void;
/**
 * Check if encryption is available on the current platform
 * @returns {boolean} True if encryption is available
 */
export declare function isEncryptionAvailable(): any;
/**
 * Get detailed encryption information
 * @returns {Object} Encryption availability details
 */
export declare function getEncryptionInfo(): {
    available: any;
    platform: NodeJS.Platform;
    backend: string;
};
/**
 * Encrypt a value and convert to base64 string
 * @param {any} value - Value to encrypt (will be JSON serialized if not a string)
 * @returns {string} Base64 encoded encrypted data
 * @throws {Error} If encryption is unavailable or fails
 */
export declare function encryptValue(value: any): string;
/**
 * Decrypt a base64 encoded encrypted string
 * @param {string} encryptedBase64 - Base64 encoded encrypted data
 * @returns {any} Decrypted value (parsed from JSON if applicable)
 * @throws {Error} If decryption fails
 */
export declare function decryptValue(encryptedBase64: any): any;
/**
 * Encrypt a value and store it in electron-store
 * @param {string} key - Storage key
 * @param {any} value - Value to encrypt and store
 * @returns {Object} Success response
 * @throws {Error} If encryption is unavailable or operation fails
 */
export declare function encryptAndStore(key: any, value: any): {
    success: boolean;
};
/**
 * Retrieve and decrypt a value from electron-store
 * @param {string} key - Storage key
 * @returns {any} Decrypted value or null if not found
 * @throws {Error} If decryption fails
 */
export declare function retrieveAndDecrypt(key: any): any;
/**
 * Delete an encrypted value from storage
 * @param {string} key - Storage key
 * @returns {Object} Success response
 */
export declare function deleteEncrypted(key: any): {
    success: boolean;
};
/**
 * Check if an encrypted value exists in storage
 * @param {string} key - Storage key
 * @returns {boolean} True if the key exists
 */
export declare function hasEncrypted(key: any): boolean;
