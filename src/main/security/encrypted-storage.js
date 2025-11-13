/**
 * Encrypted Storage Module
 * 
 * Provides secure storage for sensitive data using Electron's safeStorage API.
 * Data is encrypted using OS-level encryption mechanisms:
 * - macOS: Keychain
 * - Windows: DPAPI
 * - Linux: libsecret
 */

import { safeStorage } from 'electron';
import Store from 'electron-store';
import logger from '../logger.js';

const store = new Store();
const ENCRYPTED_PREFIX = '__ENCRYPTED__';

// Cache encryption availability to avoid repeated checks
let encryptionAvailable = null;

/**
 * Check if encryption is available on the current platform
 * @returns {boolean} True if encryption is available
 */
export function isEncryptionAvailable() {
  if (encryptionAvailable === null) {
    encryptionAvailable = safeStorage.isEncryptionAvailable();
    logger.info(`Encryption availability: ${encryptionAvailable}`, {
      platform: process.platform
    });
  }
  return encryptionAvailable;
}

/**
 * Get detailed encryption information
 * @returns {Object} Encryption availability details
 */
export function getEncryptionInfo() {
  return {
    available: isEncryptionAvailable(),
    platform: process.platform,
    backend: process.platform === 'darwin' ? 'Keychain' 
      : process.platform === 'win32' ? 'DPAPI' 
      : 'libsecret'
  };
}

/**
 * Encrypt a value and convert to base64 string
 * @param {any} value - Value to encrypt (will be JSON serialized if not a string)
 * @returns {string} Base64 encoded encrypted data
 * @throws {Error} If encryption is unavailable or fails
 */
export function encryptValue(value) {
  if (!isEncryptionAvailable()) {
    throw new Error('Encryption is not available on this platform');
  }

  if (value === null || value === undefined) {
    throw new Error('Cannot encrypt null or undefined values');
  }

  try {
    // Convert value to string if needed
    const plaintext = typeof value === 'string' ? value : JSON.stringify(value);
    
    // Encrypt and convert Buffer to base64
    const encrypted = safeStorage.encryptString(plaintext);
    return encrypted.toString('base64');
  } catch (error) {
    logger.error('Encryption failed', { error: error.message });
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt a base64 encoded encrypted string
 * @param {string} encryptedBase64 - Base64 encoded encrypted data
 * @returns {any} Decrypted value (parsed from JSON if applicable)
 * @throws {Error} If decryption fails
 */
export function decryptValue(encryptedBase64) {
  if (!isEncryptionAvailable()) {
    throw new Error('Encryption is not available on this platform');
  }

  if (!encryptedBase64) {
    throw new Error('Cannot decrypt empty value');
  }

  try {
    // Convert base64 to Buffer
    const encrypted = Buffer.from(encryptedBase64, 'base64');
    
    // Decrypt
    const plaintext = safeStorage.decryptString(encrypted);
    
    // Try to parse as JSON, return as-is if not valid JSON
    try {
      return JSON.parse(plaintext);
    } catch {
      return plaintext;
    }
  } catch (error) {
    logger.error('Decryption failed', { error: error.message });
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Encrypt a value and store it in electron-store
 * @param {string} key - Storage key
 * @param {any} value - Value to encrypt and store
 * @returns {Object} Success response
 * @throws {Error} If encryption is unavailable or operation fails
 */
export function encryptAndStore(key, value) {
  if (!key || typeof key !== 'string') {
    throw new Error('Key must be a non-empty string');
  }

  if (!isEncryptionAvailable()) {
    throw new Error('Encryption is not available on this platform');
  }

  try {
    const encrypted = encryptValue(value);
    const storageKey = `${ENCRYPTED_PREFIX}${key}`;
    
    store.set(storageKey, encrypted);
    
    logger.info('Encrypted value stored', { key });
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to encrypt and store value', { 
      key, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Retrieve and decrypt a value from electron-store
 * @param {string} key - Storage key
 * @returns {any} Decrypted value or null if not found
 * @throws {Error} If decryption fails
 */
export function retrieveAndDecrypt(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Key must be a non-empty string');
  }

  try {
    const storageKey = `${ENCRYPTED_PREFIX}${key}`;
    const encrypted = store.get(storageKey);
    
    if (!encrypted) {
      logger.debug('Encrypted value not found', { key });
      return null;
    }
    
    const decrypted = decryptValue(encrypted);
    logger.info('Encrypted value retrieved', { key });
    
    return decrypted;
  } catch (error) {
    logger.error('Failed to retrieve and decrypt value', { 
      key, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Delete an encrypted value from storage
 * @param {string} key - Storage key
 * @returns {Object} Success response
 */
export function deleteEncrypted(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Key must be a non-empty string');
  }

  try {
    const storageKey = `${ENCRYPTED_PREFIX}${key}`;
    store.delete(storageKey);
    
    logger.info('Encrypted value deleted', { key });
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to delete encrypted value', { 
      key, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Check if an encrypted value exists in storage
 * @param {string} key - Storage key
 * @returns {boolean} True if the key exists
 */
export function hasEncrypted(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Key must be a non-empty string');
  }

  const storageKey = `${ENCRYPTED_PREFIX}${key}`;
  return store.has(storageKey);
}
