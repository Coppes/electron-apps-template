/**
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock encrypted storage module BEFORE imports
vi.mock('../../../../../src/main/security/encrypted-storage.js', () => ({
  encryptAndStore: vi.fn(),
  retrieveAndDecrypt: vi.fn(),
  deleteEncrypted: vi.fn(),
  hasEncrypted: vi.fn(),
  isEncryptionAvailable: vi.fn(() => true),
}));

vi.mock('../../../../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import handlers after mocking
import {
  handleSecureStoreSet,
  handleSecureStoreGet,
  handleSecureStoreDelete,
  handleSecureStoreHas,
  handleSecureStoreIsAvailable,
} from '../../../../../src/main/ipc/handlers/secure-store.js';
import * as encryptedStorage from '../../../../../src/main/security/encrypted-storage.js';

describe('Secure Store IPC Handlers', () => {
  const mockEvent = {};

  beforeEach(() => {
    vi.clearAllMocks();
    encryptedStorage.isEncryptionAvailable.mockReturnValue(true);
  });

  describe('handleSecureStoreSet', () => {
    it('should store encrypted value successfully', async () => {
      encryptedStorage.encryptAndStore.mockReturnValue({ success: true });
      
      const result = await handleSecureStoreSet(mockEvent, {
        key: 'apiKey',
        value: 'secret123',
      });

      expect(result).toEqual({ success: true });
      expect(encryptedStorage.encryptAndStore).toHaveBeenCalledWith('apiKey', 'secret123');
    });

    it('should handle complex object values', async () => {
      const value = { username: 'user', password: 'pass' };
      encryptedStorage.encryptAndStore.mockReturnValue({ success: true });
      
      const result = await handleSecureStoreSet(mockEvent, {
        key: 'credentials',
        value,
      });

      expect(result).toEqual({ success: true });
      expect(encryptedStorage.encryptAndStore).toHaveBeenCalledWith('credentials', value);
    });

    it('should return error for missing key', async () => {
      const result = await handleSecureStoreSet(mockEvent, {
        value: 'secret',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Key must be a non-empty string');
    });

    it('should return error for empty key', async () => {
      const result = await handleSecureStoreSet(mockEvent, {
        key: '',
        value: 'secret',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Key must be a non-empty string');
    });

    it('should return error for missing value', async () => {
      const result = await handleSecureStoreSet(mockEvent, {
        key: 'apiKey',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Value is required');
    });

    it('should return error when encryption is unavailable', async () => {
      encryptedStorage.isEncryptionAvailable.mockReturnValue(false);
      
      const result = await handleSecureStoreSet(mockEvent, {
        key: 'apiKey',
        value: 'secret',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Encryption is not available');
    });

    it('should handle encryption errors', async () => {
      encryptedStorage.encryptAndStore.mockImplementation(() => {
        throw new Error('Encryption failed');
      });
      
      const result = await handleSecureStoreSet(mockEvent, {
        key: 'apiKey',
        value: 'secret',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Encryption failed');
    });
  });

  describe('handleSecureStoreGet', () => {
    it('should retrieve encrypted value successfully', async () => {
      encryptedStorage.retrieveAndDecrypt.mockReturnValue('secret123');
      
      const result = await handleSecureStoreGet(mockEvent, { key: 'apiKey' });

      expect(result).toBe('secret123');
      expect(encryptedStorage.retrieveAndDecrypt).toHaveBeenCalledWith('apiKey');
    });

    it('should return null for non-existent key', async () => {
      encryptedStorage.retrieveAndDecrypt.mockReturnValue(null);
      
      const result = await handleSecureStoreGet(mockEvent, { key: 'nonexistent' });

      expect(result).toBeNull();
    });

    it('should retrieve complex objects', async () => {
      const value = { username: 'user', password: 'pass' };
      encryptedStorage.retrieveAndDecrypt.mockReturnValue(value);
      
      const result = await handleSecureStoreGet(mockEvent, { key: 'credentials' });

      expect(result).toEqual(value);
    });

    it('should throw error for missing key', async () => {
      await expect(handleSecureStoreGet(mockEvent, {})).rejects.toThrow();
    });

    it('should handle decryption errors', async () => {
      encryptedStorage.retrieveAndDecrypt.mockImplementation(() => {
        throw new Error('Decryption failed');
      });
      
      await expect(
        handleSecureStoreGet(mockEvent, { key: 'apiKey' })
      ).rejects.toThrow('Failed to retrieve encrypted value');
    });
  });

  describe('handleSecureStoreDelete', () => {
    it('should delete encrypted value successfully', async () => {
      encryptedStorage.deleteEncrypted.mockReturnValue({ success: true });
      
      const result = await handleSecureStoreDelete(mockEvent, { key: 'apiKey' });

      expect(result).toEqual({ success: true });
      expect(encryptedStorage.deleteEncrypted).toHaveBeenCalledWith('apiKey');
    });

    it('should be idempotent (succeed even if key does not exist)', async () => {
      encryptedStorage.deleteEncrypted.mockReturnValue({ success: true });
      
      const result = await handleSecureStoreDelete(mockEvent, { key: 'nonexistent' });

      expect(result).toEqual({ success: true });
    });

    it('should return error for missing key', async () => {
      const result = await handleSecureStoreDelete(mockEvent, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Key must be a non-empty string');
    });

    it('should handle deletion errors', async () => {
      encryptedStorage.deleteEncrypted.mockImplementation(() => {
        throw new Error('Delete failed');
      });
      
      const result = await handleSecureStoreDelete(mockEvent, { key: 'apiKey' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Delete failed');
    });
  });

  describe('handleSecureStoreHas', () => {
    it('should return true for existing key', async () => {
      encryptedStorage.hasEncrypted.mockReturnValue(true);
      
      const result = await handleSecureStoreHas(mockEvent, { key: 'apiKey' });

      expect(result).toBe(true);
      expect(encryptedStorage.hasEncrypted).toHaveBeenCalledWith('apiKey');
    });

    it('should return false for non-existent key', async () => {
      encryptedStorage.hasEncrypted.mockReturnValue(false);
      
      const result = await handleSecureStoreHas(mockEvent, { key: 'nonexistent' });

      expect(result).toBe(false);
    });

    it('should return false for missing key', async () => {
      const result = await handleSecureStoreHas(mockEvent, {});

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      encryptedStorage.hasEncrypted.mockImplementation(() => {
        throw new Error('Check failed');
      });
      
      const result = await handleSecureStoreHas(mockEvent, { key: 'apiKey' });

      expect(result).toBe(false);
    });
  });

  describe('handleSecureStoreIsAvailable', () => {
    it('should return true when encryption is available', async () => {
      encryptedStorage.isEncryptionAvailable.mockReturnValue(true);
      
      const result = await handleSecureStoreIsAvailable(mockEvent, {});

      expect(result).toBe(true);
    });

    it('should return false when encryption is unavailable', async () => {
      encryptedStorage.isEncryptionAvailable.mockReturnValue(false);
      
      const result = await handleSecureStoreIsAvailable(mockEvent, {});

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      encryptedStorage.isEncryptionAvailable.mockImplementation(() => {
        throw new Error('Check failed');
      });
      
      const result = await handleSecureStoreIsAvailable(mockEvent, {});

      expect(result).toBe(false);
    });
  });
});
