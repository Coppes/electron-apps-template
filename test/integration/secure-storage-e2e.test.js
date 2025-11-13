/**
 * @vitest-environment node
 * 
 * E2E Tests for Secure Storage Feature
 * Tests the full flow from renderer to main process and back
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { app, BrowserWindow, safeStorage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Secure Storage E2E', () => {
  let mainWindow;

  beforeEach(async () => {
    // Skip if encryption not available
    if (!safeStorage.isEncryptionAvailable()) {
      // Encryption not available - tests will be skipped
      return;
    }

    await app.whenReady();
    
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../../src/preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
  });

  afterEach(async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
      mainWindow = null;
    }
  });

  it('should expose secureStore API in renderer', async () => {
    if (!safeStorage.isEncryptionAvailable()) {
      return;
    }

    const result = await mainWindow.webContents.executeJavaScript(`
      typeof window.api.secureStore === 'object' &&
      typeof window.api.secureStore.set === 'function' &&
      typeof window.api.secureStore.get === 'function' &&
      typeof window.api.secureStore.delete === 'function' &&
      typeof window.api.secureStore.has === 'function' &&
      typeof window.api.secureStore.isAvailable === 'function'
    `);

    expect(result).toBe(true);
  });

  it('should store and retrieve encrypted value through IPC', async () => {
    if (!safeStorage.isEncryptionAvailable()) {
      return;
    }

    const testKey = 'test-e2e-key';
    const testValue = 'secret-e2e-value';

    // Store value
    const storeResult = await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.set('${testKey}', '${testValue}')
    `);

    expect(storeResult).toBeUndefined(); // set returns void

    // Retrieve value
    const retrievedValue = await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.get('${testKey}')
    `);

    expect(retrievedValue).toBe(testValue);

    // Clean up
    await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.delete('${testKey}')
    `);
  });

  it('should handle complex objects', async () => {
    if (!safeStorage.isEncryptionAvailable()) {
      return;
    }

    const testKey = 'test-e2e-object';
    const testObject = { apiKey: 'abc123', userId: 456, active: true };

    // Store object
    await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.set('${testKey}', ${JSON.stringify(testObject)})
    `);

    // Retrieve object
    const retrieved = await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.get('${testKey}')
    `);

    expect(retrieved).toEqual(testObject);

    // Clean up
    await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.delete('${testKey}')
    `);
  });

  it('should check existence of keys', async () => {
    if (!safeStorage.isEncryptionAvailable()) {
      return;
    }

    const testKey = 'test-e2e-exists';

    // Check before storing
    let exists = await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.has('${testKey}')
    `);
    expect(exists).toBe(false);

    // Store value
    await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.set('${testKey}', 'value')
    `);

    // Check after storing
    exists = await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.has('${testKey}')
    `);
    expect(exists).toBe(true);

    // Delete and check again
    await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.delete('${testKey}')
    `);

    exists = await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.has('${testKey}')
    `);
    expect(exists).toBe(false);
  });

  it('should report encryption availability', async () => {
    if (!safeStorage.isEncryptionAvailable()) {
      return;
    }

    const isAvailable = await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.isAvailable()
    `);

    expect(isAvailable).toBe(true);
  });

  it('should handle deletion of non-existent keys gracefully', async () => {
    if (!safeStorage.isEncryptionAvailable()) {
      return;
    }

    const testKey = 'test-e2e-nonexistent';

    // Should not throw when deleting non-existent key
    await expect(
      mainWindow.webContents.executeJavaScript(`
        window.api.secureStore.delete('${testKey}')
      `)
    ).resolves.toBeUndefined();
  });

  it('should return null for non-existent keys', async () => {
    if (!safeStorage.isEncryptionAvailable()) {
      return;
    }

    const testKey = 'test-e2e-missing';

    const result = await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.get('${testKey}')
    `);

    expect(result).toBeNull();
  });

  it('should validate key names', async () => {
    if (!safeStorage.isEncryptionAvailable()) {
      return;
    }

    // Test with empty key
    await expect(
      mainWindow.webContents.executeJavaScript(`
        window.api.secureStore.set('', 'value')
      `)
    ).rejects.toThrow();

    // Test with null key
    await expect(
      mainWindow.webContents.executeJavaScript(`
        window.api.secureStore.set(null, 'value')
      `)
    ).rejects.toThrow();
  });

  it('should handle unicode and special characters', async () => {
    if (!safeStorage.isEncryptionAvailable()) {
      return;
    }

    const testKey = 'test-e2e-unicode';
    const testValue = '🔐 Secret: 日本語 & émojis!';

    await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.set('${testKey}', ${JSON.stringify(testValue)})
    `);

    const retrieved = await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.get('${testKey}')
    `);

    expect(retrieved).toBe(testValue);

    // Clean up
    await mainWindow.webContents.executeJavaScript(`
      window.api.secureStore.delete('${testKey}')
    `);
  });
});
