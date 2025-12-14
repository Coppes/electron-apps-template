import React from 'react';
import { useTranslation } from 'react-i18next';
import DataManagementDemo from '../components/demo/DataManagementDemo';

/**
 * DataManagementDemoPage
 * Page wrapper for data management features demonstration
 */
export default function DataManagementDemoPage() {
  const { t } = useTranslation('data_management');
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <DataManagementDemo />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">{t('api_usage.title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('api_usage.description')}
        </p>
        <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
          {`// Backup & Restore
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
});`}
        </pre>
      </div>
    </div>
  );
}
