/**
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies BEFORE importing the module
vi.mock('electron', () => ({
  safeStorage: {
    isEncryptionAvailable: vi.fn(() => true),
    encryptString: vi.fn((plaintext) => {
      if (!plaintext) throw new Error('No plaintext provided');
      return Buffer.from(plaintext, 'utf-8');
    }),
    decryptString: vi.fn((encrypted) => {
      if (!encrypted) throw new Error('No encrypted data provided');
      return encrypted.toString('utf-8');
    }),
  },
}));

vi.mock('electron-store', () => {
  const storeData = new Map();
  return {
    default: vi.fn().mockImplementation(function() {
      return {
        get: (key) => storeData.get(key),
        set: (key, value) => storeData.set(key, value),
        delete: (key) => storeData.delete(key),
        has: (key) => storeData.has(key),
        clear: () => storeData.clear(),
      };
    }),
  };
});

vi.mock('../../../src/main/logger.js', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Now import the module to test
import {
  isEncryptionAvailable,
  getEncryptionInfo,
  encryptValue,
  decryptValue,
  encryptAndStore,
  retrieveAndDecrypt,
  deleteEncrypted,
  hasEncrypted,
  _resetEncryptionCache,
} from '../../../src/main/security/encrypted-storage.js';
import { safeStorage } from 'electron';
import Store from 'electron-store';

describe('Encrypted Storage', () => {
  let storeInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    _resetEncryptionCache(); // Reset cache between tests
    // Create a new store instance for each test
    storeInstance = new Store();
    // Reset mocks to default behavior
    safeStorage.isEncryptionAvailable.mockReturnValue(true);
    safeStorage.encryptString.mockImplementation((plaintext) => {
      if (!plaintext) throw new Error('No plaintext provided');
      return Buffer.from(plaintext, 'utf-8');
    });
    safeStorage.decryptString.mockImplementation((encrypted) => {
      if (!encrypted) throw new Error('No encrypted data provided');
      return encrypted.toString('utf-8');
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isEncryptionAvailable', () => {
    it('should return true when encryption is available', () => {
      safeStorage.isEncryptionAvailable.mockReturnValue(true);
      expect(isEncryptionAvailable()).toBe(true);
    });

    it('should return false when encryption is unavailable', () => {
      safeStorage.isEncryptionAvailable.mockReturnValue(false);
      expect(isEncryptionAvailable()).toBe(false);
    });

    it('should cache the result', () => {
      isEncryptionAvailable();
      isEncryptionAvailable();
      // Should only call once (cached after first call)
      expect(safeStorage.isEncryptionAvailable).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEncryptionInfo', () => {
    it('should return encryption availability details', () => {
      const info = getEncryptionInfo();
      expect(info).toHaveProperty('available');
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('backend');
    });

    it('should return correct backend for platform', () => {
      const info = getEncryptionInfo();
      expect(typeof info.backend).toBe('string');
    });
  });

  describe('encryptValue', () => {
    it('should encrypt a string value', () => {
      const value = 'test-secret';
      const encrypted = encryptValue(value);
      expect(typeof encrypted).toBe('string');
      expect(encrypted).toBeTruthy();
    });

    it('should encrypt an object value', () => {
      const value = { apiKey: 'secret123', token: 'abc' };
      const encrypted = encryptValue(value);
      expect(typeof encrypted).toBe('string');
      expect(encrypted).toBeTruthy();
    });

    it('should throw error when encryption is unavailable', () => {
      safeStorage.isEncryptionAvailable.mockReturnValue(false);
      expect(() => encryptValue('test')).toThrow('Encryption is not available');
    });

    it('should throw error for null value', () => {
      expect(() => encryptValue(null)).toThrow('Cannot encrypt null or undefined values');
    });

    it('should throw error for undefined value', () => {
      expect(() => encryptValue(undefined)).toThrow('Cannot encrypt null or undefined values');
    });

    it('should handle encryption errors', () => {
      safeStorage.encryptString.mockImplementation(() => {
        throw new Error('Encryption failed');
      });
      expect(() => encryptValue('test')).toThrow('Encryption failed');
    });
  });

  describe('decryptValue', () => {
    it('should decrypt a string value', () => {
      const plaintext = 'test-secret';
      const encrypted = Buffer.from(plaintext, 'utf-8').toString('base64');
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt and parse JSON object', () => {
      const plaintext = JSON.stringify({ apiKey: 'secret123' });
      safeStorage.decryptString.mockReturnValue(plaintext);
      const encrypted = Buffer.from(plaintext, 'utf-8').toString('base64');
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toEqual({ apiKey: 'secret123' });
    });

    it('should throw error when encryption is unavailable', () => {
      safeStorage.isEncryptionAvailable.mockReturnValue(false);
      expect(() => decryptValue('test')).toThrow('Encryption is not available');
    });

    it('should throw error for empty value', () => {
      expect(() => decryptValue('')).toThrow('Cannot decrypt empty value');
    });

    it('should handle decryption errors', () => {
      safeStorage.decryptString.mockImplementation(() => {
        throw new Error('Decryption failed');
      });
      expect(() => decryptValue('test')).toThrow('Decryption failed');
    });
  });

  describe('encryptAndStore', () => {
    it('should encrypt and store a value', () => {
      const key = 'apiKey';
      const value = 'secret123';
      const result = encryptAndStore(key, value);
      
      expect(result).toEqual({ success: true });
      expect(hasEncrypted(key)).toBe(true);
    });

    it('should store complex objects', () => {
      const key = 'credentials';
      const value = { username: 'user', password: 'pass123' };
      const result = encryptAndStore(key, value);
      
      expect(result).toEqual({ success: true });
      expect(hasEncrypted(key)).toBe(true);
    });

    it('should throw error for invalid key', () => {
      expect(() => encryptAndStore('', 'value')).toThrow('Key must be a non-empty string');
      expect(() => encryptAndStore(null, 'value')).toThrow('Key must be a non-empty string');
    });

    it('should throw error when encryption is unavailable', () => {
      safeStorage.isEncryptionAvailable.mockReturnValue(false);
      expect(() => encryptAndStore('key', 'value')).toThrow('Encryption is not available');
    });
  });

  describe('retrieveAndDecrypt', () => {
    it('should retrieve and decrypt a stored value', () => {
      const key = 'apiKey';
      const value = 'secret123';
      
      // Store first
      encryptAndStore(key, value);
      
      // Retrieve
      const retrieved = retrieveAndDecrypt(key);
      expect(retrieved).toBe(value);
    });

    it('should return null for non-existent key', () => {
      const retrieved = retrieveAndDecrypt('nonexistent');
      expect(retrieved).toBeNull();
    });

    it('should retrieve and decrypt complex objects', () => {
      const key = 'credentials';
      const value = { username: 'user', password: 'pass123' };
      
      // Mock JSON serialization/deserialization
      safeStorage.encryptString.mockImplementation((plaintext) => 
        Buffer.from(plaintext, 'utf-8')
      );
      safeStorage.decryptString.mockImplementation((encrypted) => 
        encrypted.toString('utf-8')
      );
      
      encryptAndStore(key, value);
      const retrieved = retrieveAndDecrypt(key);
      expect(retrieved).toEqual(value);
    });

    it('should throw error for invalid key', () => {
      expect(() => retrieveAndDecrypt('')).toThrow('Key must be a non-empty string');
    });
  });

  describe('deleteEncrypted', () => {
    it('should delete an encrypted value', () => {
      const key = 'apiKey';
      encryptAndStore(key, 'secret123');
      
      expect(hasEncrypted(key)).toBe(true);
      
      const result = deleteEncrypted(key);
      expect(result).toEqual({ success: true });
      expect(hasEncrypted(key)).toBe(false);
    });

    it('should not throw error for non-existent key', () => {
      const result = deleteEncrypted('nonexistent');
      expect(result).toEqual({ success: true });
    });

    it('should throw error for invalid key', () => {
      expect(() => deleteEncrypted('')).toThrow('Key must be a non-empty string');
    });
  });

  describe('hasEncrypted', () => {
    it('should return true for existing encrypted key', () => {
      const key = 'apiKey';
      encryptAndStore(key, 'secret123');
      
      expect(hasEncrypted(key)).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(hasEncrypted('nonexistent')).toBe(false);
    });

    it('should throw error for invalid key', () => {
      expect(() => hasEncrypted('')).toThrow('Key must be a non-empty string');
    });
  });

  describe('Round-trip encryption', () => {
    it('should encrypt and decrypt string correctly', () => {
      const original = 'my-secret-value';
      const encrypted = encryptValue(original);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(original);
    });

    it('should handle special characters', () => {
      const original = 'test!@#$%^&*()_+-={}[]|\\:";\'<>?,./';
      const encrypted = encryptValue(original);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(original);
    });

    it('should handle unicode characters', () => {
      const original = '测试 🔐 テスト';
      const encrypted = encryptValue(original);
      const decrypted = decryptValue(encrypted);
      expect(decrypted).toBe(original);
    });
  });
});
