/**
 * SecureStorageDemo Component
 * 
 * Demonstrates usage of the Electron secureStore API.
 * Shows how to safely store and retrieve sensitive data like API keys,
 * tokens, and credentials.
 */

import React, { useState, useEffect } from 'react';
import { LockKey, Warning, XCircle, CheckCircle, Info } from '@phosphor-icons/react';

export default function SecureStorageDemo() {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [retrievedValue, setRetrievedValue] = useState('');
  const [status, setStatus] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Check if encryption is available on this platform
    async function checkAvailability() {
      try {
        const available = await window.api.secureStore.isAvailable();
        setIsAvailable(available);
        if (!available) {
          setStatus({ type: 'warning', message: 'Encrypted storage is not available on this platform' });
        }
      } catch (error) {
        setStatus({ type: 'error', message: `Error checking availability: ${error.message}` });
      }
    }
    checkAvailability();
  }, []);

  const handleStore = async () => {
    if (!key.trim() || !value.trim()) {
      setStatus({ type: 'error', message: 'Please enter both key and value' });
      return;
    }

    try {
      await window.api.secureStore.set(key, value);
      setStatus({ type: 'success', message: `Successfully stored "${key}"` });
      setValue(''); // Clear value for security
    } catch (error) {
      setStatus({ type: 'error', message: `Error storing: ${error.message}` });
    }
  };

  const handleRetrieve = async () => {
    if (!key.trim()) {
      setStatus({ type: 'error', message: 'Please enter a key' });
      return;
    }

    try {
      const result = await window.api.secureStore.get(key);
      if (result !== null) {
        setRetrievedValue(result);
        setStatus({ type: 'success', message: `Retrieved value for "${key}"` });
      } else {
        setRetrievedValue('');
        setStatus({ type: 'info', message: `No value found for "${key}"` });
      }
    } catch (error) {
      setStatus({ type: 'error', message: `Error retrieving: ${error.message}` });
      setRetrievedValue('');
    }
  };

  const handleDelete = async () => {
    if (!key.trim()) {
      setStatus({ type: 'error', message: 'Please enter a key' });
      return;
    }

    try {
      await window.api.secureStore.delete(key);
      setStatus({ type: 'success', message: `Deleted "${key}"` });
      setRetrievedValue('');
    } catch (error) {
      setStatus({ type: 'error', message: `Error deleting: ${error.message}` });
    }
  };

  const handleCheck = async () => {
    if (!key.trim()) {
      setStatus({ type: 'error', message: 'Please enter a key' });
      return;
    }

    try {
      const exists = await window.api.secureStore.has(key);
      setStatus({ type: 'success', message: exists ? `"${key}" exists` : `"${key}" does not exist` });
    } catch (error) {
      setStatus({ type: 'error', message: `Error checking: ${error.message}` });
    }
  };

  if (!isAvailable) {
    return (
      <div className="secure-storage-demo">
        <h2 className="flex items-center gap-2">
          <LockKey className="w-6 h-6 text-primary" />
          Secure Storage Demo
        </h2>
        <div className="status-message warning">
          <div className="flex items-center gap-2 mb-2">
            <Warning className="w-5 h-5" />
            <span>Encrypted storage is not available on this platform.</span>
          </div>
          <p>Encryption requires:</p>
          <ul>
            <li>macOS: Keychain access</li>
            <li>Windows: DPAPI</li>
            <li>Linux: libsecret (gnome-keyring or equivalent)</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="secure-storage-demo">
      <h2 className="flex items-center gap-2">
        <LockKey className="w-6 h-6 text-primary" />
        Secure Storage Demo
      </h2>

      <div className="info-box">
        <p>
          This demo shows how to securely store sensitive data like API keys,
          tokens, and credentials using OS-level encryption.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="key">Key:</label>
        <input
          id="key"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="e.g., apiKey, authToken"
        />
      </div>

      <div className="form-group">
        <label htmlFor="value">Value (sensitive data):</label>
        <input
          id="value"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter sensitive value to store"
        />
      </div>

      <div className="button-group">
        <button onClick={handleStore} disabled={!isAvailable}>
          Store
        </button>
        <button onClick={handleRetrieve} disabled={!isAvailable}>
          Retrieve
        </button>
        <button onClick={handleCheck} disabled={!isAvailable}>
          Check Exists
        </button>
        <button onClick={handleDelete} disabled={!isAvailable}>
          Delete
        </button>
      </div>

      {retrievedValue && (
        <div className="retrieved-value">
          <label>Retrieved Value:</label>
          <code>{retrievedValue}</code>
        </div>
      )}

      {status && (
        <div className={`status-message ${status.type}`}>
          <div className="flex items-center gap-2">
            {status.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
            {status.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            {status.type === 'warning' && <Warning className="w-5 h-5 flex-shrink-0" />}
            {status.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
            <span>{status.message}</span>
          </div>
        </div>
      )}

      <div className="security-notes">
        <h3 className="flex items-center gap-2">
          <LockKey className="w-4 h-4" />
          Security Notes:
        </h3>
        <ul>
          <li>Data is encrypted using OS-level encryption (Keychain/DPAPI/libsecret)</li>
          <li>Encryption keys are managed by the operating system</li>
          <li>Values are never logged or exposed in production</li>
          <li>Use for: API keys, auth tokens, credentials, secrets</li>
          <li>Don&apos;t use for: Large files, frequently accessed data, non-sensitive data</li>
        </ul>
      </div>

      <style>{`
        .secure-storage-demo {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: white;
        }

        h2 {
          margin-top: 0;
          color: #333;
        }

        .info-box {
          background: #f0f7ff;
          border-left: 4px solid #2196f3;
          padding: 12px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #555;
        }

        input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        input:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }

        .button-group {
          display: flex;
          gap: 10px;
          margin: 20px 0;
        }

        button {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          background: #2196f3;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        button:hover:not(:disabled) {
          background: #1976d2;
        }

        button:disabled {
          background: #bdbdbd;
          cursor: not-allowed;
        }

        .retrieved-value {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          margin: 16px 0;
        }

        .retrieved-value code {
          font-family: 'Monaco', 'Courier New', monospace;
          color: #333;
          word-break: break-all;
        }

        .status-message {
          padding: 12px;
          border-radius: 4px;
          margin: 16px 0;
        }

        .status-message.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-message.error {
          background: #ffebee;
          color: #c62828;
        }

        .status-message.info {
          background: #e3f2fd;
          color: #1565c0;
        }

        .status-message.warning {
          background: #fff3e0;
          color: #e65100;
        }

        .security-notes {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }

        .security-notes h3 {
          margin-top: 0;
          font-size: 16px;
          color: #555;
        }

        .security-notes ul {
          margin: 8px 0;
          padding-left: 20px;
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
