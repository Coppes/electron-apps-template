import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SecureStorageDemo from '../components/features/secure-storage/SecureStorageDemo';
import { useTranslation } from 'react-i18next';
/**
 * SecureStorageDemoPage
 * Page wrapper for secure storage demonstration
 */
export default function SecureStorageDemoPage() {
    const { t } = useTranslation();
    return (_jsxs("div", { className: "container mx-auto p-6 max-w-6xl", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: t('secure_storage.title') }), _jsx("p", { className: "text-muted-foreground", children: t('secure_storage.description') })] }), _jsx(SecureStorageDemo, {}), _jsxs("div", { className: "mt-8 p-4 bg-muted rounded-lg", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: t('secure_storage.encryption_details.title') }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: t('secure_storage.encryption_details.intro') }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 text-muted-foreground", children: [_jsx("li", { children: t('secure_storage.encryption_details.aes') }), _jsx("li", { children: t('secure_storage.encryption_details.pbkdf2') }), _jsx("li", { children: t('secure_storage.encryption_details.salt') }), _jsx("li", { children: t('secure_storage.encryption_details.keychain') }), _jsx("li", { children: t('secure_storage.encryption_details.timing') })] }), _jsx("h3", { className: "text-md font-semibold mt-4 mb-2", children: t('secure_storage.best_practices.title') }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 text-muted-foreground", children: [_jsx("li", { children: t('secure_storage.best_practices.no_plain') }), _jsx("li", { children: t('secure_storage.best_practices.strong_pass') }), _jsx("li", { children: t('secure_storage.best_practices.rotation') }), _jsx("li", { children: t('secure_storage.best_practices.backup') }), _jsx("li", { children: t('secure_storage.best_practices.separation') })] }), _jsx("h3", { className: "text-md font-semibold mt-4 mb-2", children: t('secure_storage.migration.title') }), _jsx("pre", { className: "bg-background p-3 rounded text-xs overflow-x-auto mt-2", children: `// Migrate from plain storage to secure storage
const plainValue = await window.electronAPI.storage.get('sensitive-data');
await window.electronAPI.storage.set('sensitive-data', plainValue, {
  encrypted: true,
  keyId: 'app-master-key'
});

// Re-encrypt with new key
await window.electronAPI.storage.rotateKey('sensitive-data', 'new-key-id');` })] })] }));
}
