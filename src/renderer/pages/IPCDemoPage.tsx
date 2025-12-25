import React from 'react';
import { useTranslation } from 'react-i18next';
import IPCDemo from '../components/demo/IPCDemo';

/**
 * IPCDemoPage
 * Page wrapper for IPC communication demonstration
 */
export default function IPCDemoPage() {
  const { t } = useTranslation('ipc');
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <IPCDemo />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">{t('architecture.title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('architecture.intro')}
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>{t('architecture.exposed')}</li>
          <li>{t('architecture.validation')}</li>
          <li>{t('architecture.error_handling')}</li>
          <li>{t('architecture.no_node')}</li>
          <li>{t('architecture.context')}</li>
        </ul>

        <h3 className="text-md font-semibold mt-4 mb-2">{t('security.title')}</h3>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>{t('security.no_exec')}</li>
          <li>{t('security.validate')}</li>
          <li>{t('security.allow_lists')}</li>
          <li>{t('security.errors')}</li>
          <li>{t('security.logging')}</li>
        </ul>
      </div>
    </div>
  );
}
