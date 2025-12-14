import React from 'react';
import { useTranslation } from 'react-i18next';
import ConnectivityDemo from '../components/demo/ConnectivityDemo';

/**
 * ConnectivityDemoPage
 * Page wrapper for connectivity and sync queue demonstration
 */
export default function ConnectivityDemoPage() {
  const { t } = useTranslation('connectivity');
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <ConnectivityDemo />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">{t('features.title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('features.intro')}
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>{t('features.queue')}</li>
          <li>{t('features.retry')}</li>
          <li>{t('features.persist')}</li>
          <li>{t('features.feedback')}</li>
        </ul>
      </div>
    </div>
  );
}
