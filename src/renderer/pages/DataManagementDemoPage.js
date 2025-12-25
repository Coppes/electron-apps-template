import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import DataManagementDemo from '../components/demo/DataManagementDemo';
/**
 * DataManagementDemoPage
 * Page wrapper for data management features demonstration
 */
export default function DataManagementDemoPage() {
    const { t } = useTranslation('data_management');
    return (_jsxs("div", { className: "container mx-auto p-6 max-w-6xl", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: t('title') }), _jsx("p", { className: "text-muted-foreground", children: t('description') })] }), _jsx(DataManagementDemo, {}), _jsxs("div", { className: "mt-8 p-4 bg-muted rounded-lg", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: t('api_usage.title') }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: t('api_usage.description') }), _jsx("pre", { className: "bg-background p-3 rounded text-xs overflow-x-auto", children: `// Backup & Restore
await window.electronAPI.data.createBackup({ includeSecureStorage: true });
await window.electronAPI.data.listBackups();
await window.electronAPI.data.restoreBackup({ filename: 'backup.json' });

// Import & Export
await window.electronAPI.data.exportData({ data, format: 'json' });
await window.electronAPI.data.importData({ path: '/path/to/file.json' });

// File Watching
await window.electronAPI.data.watchPath({ path: '/folder/to/watch' });
await window.electronAPI.data.unwatchPath({ path: '/folder/to/watch' });
window.electronAPI.events.onFileChange((event) => {
  console.log(event.type, event.path);
});` })] })] }));
}
