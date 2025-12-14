import React from 'react';
import SecureStorageDemo from '../components/features/secure-storage/SecureStorageDemo';
import { useTranslation } from 'react-i18next';

/**
 * SecureStorageDemoPage
 * Page wrapper for secure storage demonstration
 */
export default function SecureStorageDemoPage() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('secure_storage.title')}</h1>
        <p className="text-muted-foreground">
          {t('secure_storage.description')}
        </p>
      </div>

      <SecureStorageDemo />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">{t('secure_storage.encryption_details.title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('secure_storage.encryption_details.intro')}
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>{t('secure_storage.encryption_details.aes')}</li>
          <li>{t('secure_storage.encryption_details.pbkdf2')}</li>
          <li>{t('secure_storage.encryption_details.salt')}</li>
          <li>{t('secure_storage.encryption_details.keychain')}</li>
          <li>{t('secure_storage.encryption_details.timing')}</li>
        </ul>

        <h3 className="text-md font-semibold mt-4 mb-2">{t('secure_storage.best_practices.title')}</h3>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>{t('secure_storage.best_practices.no_plain')}</li>
          <li>{t('secure_storage.best_practices.strong_pass')}</li>
          <li>{t('secure_storage.best_practices.rotation')}</li>
          <li>{t('secure_storage.best_practices.backup')}</li>
          <li>{t('secure_storage.best_practices.separation')}</li>
        </ul>

        <h3 className="text-md font-semibold mt-4 mb-2">{t('secure_storage.migration.title')}</h3>
        <pre className="bg-background p-3 rounded text-xs overflow-x-auto mt-2">
          {`// Migrate from plain storage to secure storage
const plainValue = await window.electronAPI.storage.get('sensitive-data');
await window.electronAPI.storage.set('sensitive-data', plainValue, {
  encrypted: true,
  keyId: 'app-master-key'
});

// Re-encrypt with new key
await window.electronAPI.storage.rotateKey('sensitive-data', 'new-key-id');`}
        </pre>
      </div>
    </div>
  );
}
