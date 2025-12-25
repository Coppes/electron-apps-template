import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * SecureStorageDemo Component
 *
 * Demonstrates usage of the Electron secureStore API.
 * Shows how to safely store and retrieve sensitive data like API keys,
 * tokens, and credentials.
 */
import { useState, useEffect } from 'react';
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
            }
            catch (error) {
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
        }
        catch (error) {
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
            }
            else {
                setRetrievedValue('');
                setStatus({ type: 'info', message: t('secure_storage.demo.messages.not_found', { key }) });
            }
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            setStatus({ type: 'error', message: t('secure_storage.demo.messages.check_error', { error: error.message }) });
        }
    };
    if (!isAvailable) {
        return (_jsxs("div", { className: "secure-storage-demo", children: [_jsxs("h2", { className: "flex items-center gap-2", children: [_jsx(LockKey, { className: "w-6 h-6 text-primary" }), "Secure Storage Demo"] }), _jsxs("div", { className: "status-message warning", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Warning, { className: "w-5 h-5" }), _jsx("span", { children: t('secure_storage.demo.unavailable') })] }), _jsx("p", { children: t('secure_storage.demo.requirements') }), _jsxs("ul", { children: [_jsx("li", { children: "macOS: Keychain access" }), _jsx("li", { children: "Windows: DPAPI" }), _jsx("li", { children: "Linux: libsecret (gnome-keyring or equivalent)" })] })] })] }));
    }
    return (_jsxs("div", { className: "secure-storage-demo", children: [_jsxs("h2", { className: "flex items-center gap-2", children: [_jsx(LockKey, { className: "w-6 h-6 text-primary" }), t('secure_storage.title')] }), _jsx("div", { className: "info-box", children: _jsx("p", { children: t('secure_storage.demo.description') }) }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "key", children: t('secure_storage.demo.key_label') }), _jsx("input", { id: "key", type: "text", value: key, onChange: (e) => setKey(e.target.value), placeholder: t('secure_storage.demo.key_placeholder') })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "value", children: t('secure_storage.demo.value_label') }), _jsx("input", { id: "value", type: "password", value: value, onChange: (e) => setValue(e.target.value), placeholder: t('secure_storage.demo.value_placeholder') })] }), _jsxs("div", { className: "button-group", children: [_jsx("button", { onClick: handleStore, disabled: !isAvailable, children: t('secure_storage.demo.store') }), _jsx("button", { onClick: handleRetrieve, disabled: !isAvailable, children: t('secure_storage.demo.retrieve') }), _jsx("button", { onClick: handleCheck, disabled: !isAvailable, children: t('secure_storage.demo.check') }), _jsx("button", { onClick: handleDelete, disabled: !isAvailable, children: t('secure_storage.demo.delete') })] }), retrievedValue && (_jsxs("div", { className: "retrieved-value", children: [_jsx("label", { children: t('secure_storage.demo.retrieved') }), _jsx("code", { children: retrievedValue })] })), status && (_jsx("div", { className: `status-message ${status.type}`, children: _jsxs("div", { className: "flex items-center gap-2", children: [status.type === 'error' && _jsx(XCircle, { className: "w-5 h-5 flex-shrink-0" }), status.type === 'success' && _jsx(CheckCircle, { className: "w-5 h-5 flex-shrink-0" }), status.type === 'warning' && _jsx(Warning, { className: "w-5 h-5 flex-shrink-0" }), status.type === 'info' && _jsx(Info, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { children: status.message })] }) })), _jsxs("div", { className: "security-notes", children: [_jsxs("h3", { className: "flex items-center gap-2", children: [_jsx(LockKey, { className: "w-4 h-4" }), t('secure_storage.demo.security_notes')] }), _jsxs("ul", { children: [_jsx("li", { children: t('secure_storage.demo.note_encryption') }), _jsx("li", { children: t('secure_storage.demo.note_management') }), _jsx("li", { children: t('secure_storage.demo.note_logs') }), _jsx("li", { children: t('secure_storage.demo.note_use_cases') }), _jsx("li", { children: t('secure_storage.demo.note_limitations') })] })] }), _jsx("style", { children: `
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
      ` })] }));
}
