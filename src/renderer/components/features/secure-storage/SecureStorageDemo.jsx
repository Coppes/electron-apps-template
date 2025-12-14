/**
 * SecureStorageDemo Component
 * 
 * Demonstrates usage of the Electron secureStore API.
 * Shows how to safely store and retrieve sensitive data like API keys,
 * tokens, and credentials.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LockKey, Warning, XCircle, CheckCircle, Info } from '@phosphor-icons/react';

export default function SecureStorageDemo() {
  const { t } = useTranslation();
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
          setStatus({ type: 'warning', message: t('secure_storage.demo.messages.avail_warning') });
        }
      } catch (error) {
        setStatus({ type: 'error', message: t('secure_storage.demo.messages.avail_error', { error: error.message }) });
      }
    }
    checkAvailability();
  }, [t]);

  const handleStore = async () => {
    if (!key.trim() || !value.trim()) {
      setStatus({ type: 'error', message: t('secure_storage.demo.messages.enter_both') });
      return;
    }

    try {
      await window.api.secureStore.set(key, value);
      setStatus({ type: 'success', message: t('secure_storage.demo.messages.stored', { key }) });
      setValue(''); // Clear value for security
    } catch (error) {
      setStatus({ type: 'error', message: t('secure_storage.demo.messages.store_error', { error: error.message }) });
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
        setStatus({ type: 'success', message: t('secure_storage.demo.messages.retrieved_success', { key }) });
      } else {
        setRetrievedValue('');
        setStatus({ type: 'info', message: t('secure_storage.demo.messages.not_found', { key }) });
      }
    } catch (error) {
      setStatus({ type: 'error', message: t('secure_storage.demo.messages.retrieve_error', { error: error.message }) });
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
      setStatus({ type: 'success', message: t('secure_storage.demo.messages.deleted', { key }) });
      setRetrievedValue('');
    } catch (error) {
      setStatus({ type: 'error', message: t('secure_storage.demo.messages.delete_error', { error: error.message }) });
    }
  };

  const handleCheck = async () => {
    if (!key.trim()) {
      setStatus({ type: 'error', message: 'Please enter a key' });
      return;
    }

    try {
      const exists = await window.api.secureStore.has(key);
      setStatus({ type: 'success', message: exists ? t('secure_storage.demo.messages.exists', { key }) : t('secure_storage.demo.messages.not_exists', { key }) });
    } catch (error) {
      setStatus({ type: 'error', message: t('secure_storage.demo.messages.check_error', { error: error.message }) });
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
            <span>{t('secure_storage.demo.unavailable')}</span>
          </div>
          <p>{t('secure_storage.demo.requirements')}</p>
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
        {t('secure_storage.title')}
      </h2>

      <div className="info-box">
        <p>
          {t('secure_storage.demo.description')}
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="key">{t('secure_storage.demo.key_label')}</label>
        <input
          id="key"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={t('secure_storage.demo.key_placeholder')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="value">{t('secure_storage.demo.value_label')}</label>
        <input
          id="value"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('secure_storage.demo.value_placeholder')}
        />
      </div>

      <div className="button-group">
        <button onClick={handleStore} disabled={!isAvailable}>
          {t('secure_storage.demo.store')}
        </button>
        <button onClick={handleRetrieve} disabled={!isAvailable}>
          {t('secure_storage.demo.retrieve')}
        </button>
        <button onClick={handleCheck} disabled={!isAvailable}>
          {t('secure_storage.demo.check')}
        </button>
        <button onClick={handleDelete} disabled={!isAvailable}>
          {t('secure_storage.demo.delete')}
        </button>
      </div>

      {retrievedValue && (
        <div className="retrieved-value">
          <label>{t('secure_storage.demo.retrieved')}</label>
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
          {t('secure_storage.demo.security_notes')}
        </h3>
        <ul>
          <li>{t('secure_storage.demo.note_encryption')}</li>
          <li>{t('secure_storage.demo.note_management')}</li>
          <li>{t('secure_storage.demo.note_logs')}</li>
          <li>{t('secure_storage.demo.note_use_cases')}</li>
          <li>{t('secure_storage.demo.note_limitations')}</li>
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
