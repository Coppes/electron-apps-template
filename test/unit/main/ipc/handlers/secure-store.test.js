/**
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleSecureStoreSet,
  handleSecureStoreGet,
  handleSecureStoreDelete,
  handleSecureStoreHas,
  handleSecureStoreIsAvailable,
} from '../../../src/main/ipc/handlers/secure-store.js';

// Mock encrypted storage module
const mockEncryptedStorage = {
  encryptAndStore: vi.fn(),
  retrieveAndDecrypt: vi.fn(),
  deleteEncrypted: vi.fn(),
  hasEncrypted: vi.fn(),
  isEncryptionAvailable: vi.fn(() => true),
};

vi.mock('../../../src/main/security/encrypted-storage.js', () => mockEncryptedStorage);

vi.mock('../../../src/main/logger.js', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Secure Store IPC Handlers', () => {
  const mockEvent = {};

  beforeEach(() => {
    vi.clearAllMocks();
    mockEncryptedStorage.isEncryptionAvailable.mockReturnValue(true);
  });

  describe('handleSecureStoreSet', () => {
    it('should store encrypted value successfully', async () => {
      mockEncryptedStorage.encryptAndStore.mockReturnValue({ success: true });
      
      const result = await handleSecureStoreSet(mockEvent, {
        key: 'apiKey',
        value: 'secret123',
      });

      expect(result).toEqual({ success: true });
      expect(mockEncryptedStorage.encryptAndStore).toHaveBeenCalledWith('apiKey', 'secret123');
    });

    it('should handle complex object values', async () => {
      const value = { username: 'user', password: 'pass' };
      mockEncryptedStorage.encryptAndStore.mockReturnValue({ success: true });
      
      const result = await handleSecureStoreSet(mockEvent, {
        key: 'credentials',
        value,
      });

      expect(result).toEqual({ success: true });
      expect(mockEncryptedStorage.encryptAndStore).toHaveBeenCalledWith('credentials', value);
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
      mockEncryptedStorage.isEncryptionAvailable.mockReturnValue(false);
      
      const result = await handleSecureStoreSet(mockEvent, {
        key: 'apiKey',
        value: 'secret',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Encryption is not available');
    });

    it('should handle encryption errors', async () => {
      mockEncryptedStorage.encryptAndStore.mockImplementation(() => {
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
      mockEncryptedStorage.retrieveAndDecrypt.mockReturnValue('secret123');
      
      const result = await handleSecureStoreGet(mockEvent, { key: 'apiKey' });

      expect(result).toBe('secret123');
      expect(mockEncryptedStorage.retrieveAndDecrypt).toHaveBeenCalledWith('apiKey');
    });

    it('should return null for non-existent key', async () => {
      mockEncryptedStorage.retrieveAndDecrypt.mockReturnValue(null);
      
      const result = await handleSecureStoreGet(mockEvent, { key: 'nonexistent' });

      expect(result).toBeNull();
    });

    it('should retrieve complex objects', async () => {
      const value = { username: 'user', password: 'pass' };
      mockEncryptedStorage.retrieveAndDecrypt.mockReturnValue(value);
      
      const result = await handleSecureStoreGet(mockEvent, { key: 'credentials' });

      expect(result).toEqual(value);
    });

    it('should throw error for missing key', async () => {
      await expect(handleSecureStoreGet(mockEvent, {})).rejects.toThrow();
    });

    it('should handle decryption errors', async () => {
      mockEncryptedStorage.retrieveAndDecrypt.mockImplementation(() => {
        throw new Error('Decryption failed');
      });
      
      await expect(
        handleSecureStoreGet(mockEvent, { key: 'apiKey' })
      ).rejects.toThrow('Failed to retrieve encrypted value');
    });
  });

  describe('handleSecureStoreDelete', () => {
    it('should delete encrypted value successfully', async () => {
      mockEncryptedStorage.deleteEncrypted.mockReturnValue({ success: true });
      
      const result = await handleSecureStoreDelete(mockEvent, { key: 'apiKey' });

      expect(result).toEqual({ success: true });
      expect(mockEncryptedStorage.deleteEncrypted).toHaveBeenCalledWith('apiKey');
    });

    it('should be idempotent (succeed even if key does not exist)', async () => {
      mockEncryptedStorage.deleteEncrypted.mockReturnValue({ success: true });
      
      const result = await handleSecureStoreDelete(mockEvent, { key: 'nonexistent' });

      expect(result).toEqual({ success: true });
    });

    it('should return error for missing key', async () => {
      const result = await handleSecureStoreDelete(mockEvent, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Key must be a non-empty string');
    });

    it('should handle deletion errors', async () => {
      mockEncryptedStorage.deleteEncrypted.mockImplementation(() => {
        throw new Error('Delete failed');
      });
      
      const result = await handleSecureStoreDelete(mockEvent, { key: 'apiKey' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Delete failed');
    });
  });

  describe('handleSecureStoreHas', () => {
    it('should return true for existing key', async () => {
      mockEncryptedStorage.hasEncrypted.mockReturnValue(true);
      
      const result = await handleSecureStoreHas(mockEvent, { key: 'apiKey' });

      expect(result).toBe(true);
      expect(mockEncryptedStorage.hasEncrypted).toHaveBeenCalledWith('apiKey');
    });

    it('should return false for non-existent key', async () => {
      mockEncryptedStorage.hasEncrypted.mockReturnValue(false);
      
      const result = await handleSecureStoreHas(mockEvent, { key: 'nonexistent' });

      expect(result).toBe(false);
    });

    it('should return false for missing key', async () => {
      const result = await handleSecureStoreHas(mockEvent, {});

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockEncryptedStorage.hasEncrypted.mockImplementation(() => {
        throw new Error('Check failed');
      });
      
      const result = await handleSecureStoreHas(mockEvent, { key: 'apiKey' });

      expect(result).toBe(false);
    });
  });

  describe('handleSecureStoreIsAvailable', () => {
    it('should return true when encryption is available', async () => {
      mockEncryptedStorage.isEncryptionAvailable.mockReturnValue(true);
      
      const result = await handleSecureStoreIsAvailable(mockEvent, {});

      expect(result).toBe(true);
    });

    it('should return false when encryption is unavailable', async () => {
      mockEncryptedStorage.isEncryptionAvailable.mockReturnValue(false);
      
      const result = await handleSecureStoreIsAvailable(mockEvent, {});

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockEncryptedStorage.isEncryptionAvailable.mockImplementation(() => {
        throw new Error('Check failed');
      });
      
      const result = await handleSecureStoreIsAvailable(mockEvent, {});

      expect(result).toBe(false);
    });
  });
});
