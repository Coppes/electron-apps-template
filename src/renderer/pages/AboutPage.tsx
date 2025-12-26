import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Separator from '../components/ui/Separator';

import { useTranslation } from 'react-i18next';
import { VersionInfo } from '../../common/types';

const AboutPage = () => {
  const { t } = useTranslation('common');
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVersionInfo = async () => {
      try {
        if (window.electronAPI?.app) {
          const response = await window.electronAPI.app.getVersion();
          setVersionInfo(response.data || null);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading version info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVersionInfo();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('about.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('about.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('about.template_title')}</CardTitle>
            <CardDescription>
              {t('about.template_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">{t('about.loading')}</p>
            ) : versionInfo ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('about.app_version')}</span>
                  <span className="text-muted-foreground">{versionInfo.app}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Electron</span>
                  <span className="text-muted-foreground">{versionInfo.electron}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Chrome</span>
                  <span className="text-muted-foreground">{versionInfo.chrome}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Node.js</span>
                  <span className="text-muted-foreground">{versionInfo.node}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">V8</span>
                  <span className="text-muted-foreground">{versionInfo.v8}</span>
                </div>
              </div>
            ) : (
              <p className="text-red-600">{t('about.error')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('about.features.title')}</CardTitle>
            <CardDescription>
              {t('about.features.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>{t('about.features.ipc')}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>{t('about.features.context')}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>{t('about.features.react')}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>{t('about.features.ui')}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>{t('about.features.settings')}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>{t('about.features.dialog')}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>{t('about.features.layout')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('about.license.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('about.license.text')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
