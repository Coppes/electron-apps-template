/**
 * Secure Store IPC Handlers
 * 
 * Provides IPC handlers for encrypted storage operations using Electron's safeStorage API.
 */

import { IPC_CHANNELS } from '../../../common/constants.ts';
import { logger } from '../../logger.ts';
import {
  encryptAndStore,
  retrieveAndDecrypt,
  deleteEncrypted,
  hasEncrypted,
  isEncryptionAvailable,
} from '../../security/encrypted-storage.ts';

/**
 * Validate that a key is provided and is a non-empty string
 * @param {any} key - Key to validate
 * @throws {Error} If key is invalid
 */
function validateKey(key) {
  if (!key || typeof key !== 'string' || key.trim() === '') {
    throw new Error('Key must be a non-empty string');
  }
}

/**
 * Handle SECURE_STORE_SET - Encrypt and store a value
 * @param {Object} event - IPC event
 * @param {Object} payload - Request payload
 * @param {string} payload.key - Storage key
 * @param {any} payload.value - Value to encrypt and store
 * @returns {Object} Success response or error
 */
export async function handleSecureStoreSet(event, payload) {
  try {
    const { key, value } = payload || {};
    
    validateKey(key);
    
    if (value === undefined) {
      throw new Error('Value is required');
    }
    
    if (!isEncryptionAvailable()) {
      throw new Error('Encryption is not available on this platform. Please ensure your system has the necessary encryption backend installed.');
    }
    
    encryptAndStore(key, value);
    
    logger.debug('Secure store set successful', { key });
    
    return { success: true };
  } catch (error) {
    logger.error('Secure store set failed', { 
      error: error.message,
      key: payload?.key 
    });
    
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Handle SECURE_STORE_GET - Retrieve and decrypt a value
 * @param {Object} event - IPC event
 * @param {Object} payload - Request payload
 * @param {string} payload.key - Storage key
 * @returns {any} Decrypted value or null if not found
 */
export async function handleSecureStoreGet(event, payload) {
  try {
    const { key } = payload || {};
    
    validateKey(key);
    
    const value = retrieveAndDecrypt(key);
    
    logger.debug('Secure store get successful', { 
      key, 
      found: value !== null 
    });
    
    return value;
  } catch (error) {
    logger.error('Secure store get failed', { 
      error: error.message,
      key: payload?.key 
    });
    
    throw new Error(`Failed to retrieve encrypted value: ${error.message}`);
  }
}

/**
 * Handle SECURE_STORE_DELETE - Delete an encrypted value
 * @param {Object} event - IPC event
 * @param {Object} payload - Request payload
 * @param {string} payload.key - Storage key
 * @returns {Object} Success response
 */
export async function handleSecureStoreDelete(event, payload) {
  try {
    const { key } = payload || {};
    
    validateKey(key);
    
    deleteEncrypted(key);
    
    logger.debug('Secure store delete successful', { key });
    
    return { success: true };
  } catch (error) {
    logger.error('Secure store delete failed', { 
      error: error.message,
      key: payload?.key 
    });
    
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Handle SECURE_STORE_HAS - Check if an encrypted value exists
 * @param {Object} event - IPC event
 * @param {Object} payload - Request payload
 * @param {string} payload.key - Storage key
 * @returns {boolean} True if the key exists
 */
export async function handleSecureStoreHas(event, payload) {
  try {
    const { key } = payload || {};
    
    validateKey(key);
    
    const exists = hasEncrypted(key);
    
    logger.debug('Secure store has check', { key, exists });
    
    return exists;
  } catch (error) {
    logger.error('Secure store has check failed', { 
      error: error.message,
      key: payload?.key 
    });
    
    return false;
  }
}

/**
 * Handle SECURE_STORE_IS_AVAILABLE - Check if encryption is available
 * @param {Object} _event - IPC event (unused)
 * @param {Object} _payload - Request payload (unused)
 * @returns {boolean} True if encryption is available
 */
export async function handleSecureStoreIsAvailable(_event, _payload) {
  try {
    const available = isEncryptionAvailable();
    
    logger.debug('Secure store availability check', { available });
    
    return available;
  } catch (error) {
    logger.error('Secure store availability check failed', { 
      error: error.message 
    });
    
    return false;
  }
}

// Export handler mapping
export const secureStoreHandlers = {
  [IPC_CHANNELS.SECURE_STORE_SET]: handleSecureStoreSet,
  [IPC_CHANNELS.SECURE_STORE_GET]: handleSecureStoreGet,
  [IPC_CHANNELS.SECURE_STORE_DELETE]: handleSecureStoreDelete,
  [IPC_CHANNELS.SECURE_STORE_HAS]: handleSecureStoreHas,
  [IPC_CHANNELS.SECURE_STORE_IS_AVAILABLE]: handleSecureStoreIsAvailable,
};
