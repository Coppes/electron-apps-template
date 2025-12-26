import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, Cards, Chat, Lock, FloppyDisk } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Separator from '../ui/Separator';

/**
 * IPCDemo Component
 * Demonstrates IPC communication patterns and APIs
 */
export default function IPCDemo() {
  const { t } = useTranslation('ipc');
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [activeSection, setActiveSection] = useState('app');
  const [result, setResult] = useState<{ type: string; text?: string; data?: any; description?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [storageKey, setStorageKey] = useState('demo-key');
  const [storageValue, setStorageValue] = useState('demo-value');

  const callAPI = async (apiCall: () => Promise<any>, description: string) => {
    try {
      setLoading(true);
      setResult({ type: 'loading', text: t('demo.result.loading', { desc: description }) });
      const data = await apiCall();
      setResult({ type: 'success', data, description });
    } catch (error) {
      setResult({ type: 'error', text: (error as Error).message, description });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'app', label: t('demo.sections.app'), icon: Monitor },
    { id: 'window', label: t('demo.sections.window'), icon: Cards },
    { id: 'dialog', label: t('demo.sections.dialog'), icon: Chat },
    { id: 'storage', label: t('demo.sections.storage'), icon: Lock },
    { id: 'data', label: t('demo.sections.data'), icon: FloppyDisk },
  ];

  return (
    <div className="space-y-4">
      {/* Section Navigation */}
      <div className="flex gap-2 border-b border-border pb-2 flex-wrap">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'default' : 'ghost'}
              className="gap-2"
              onClick={() => setActiveSection(section.id)}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </Button>
          );
        })}
      </div>

      {/* Result Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{t('demo.result.title', { desc: result.description })}</CardTitle>
          </CardHeader>
          <CardContent>
            {result.type === 'loading' && (
              <div className="text-muted-foreground">{result.text}</div>
            )}
            {result.type === 'error' && (
              <div className="text-red-600">{t('demo.result.error', { error: result.text })}</div>
            )}
            {result.type === 'success' && (
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* App APIs */}
      {activeSection === 'app' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('demo.app.title')}</CardTitle>
            <CardDescription>{t('demo.app.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.app.getVersion(),
                t('demo.app.get_version')
              )}
              disabled={loading}
            >
              {t('demo.app.get_version')}
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.app.getPath('userData'),
                t('demo.app.get_path')
              )}
              disabled={loading}
            >
              {t('demo.app.get_path')}
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.app.getPlatform(),
                t('demo.app.get_platform')
              )}
              disabled={loading}
            >
              {t('demo.app.get_platform')}
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.app.isPackaged(),
                t('demo.app.is_packaged')
              )}
              disabled={loading}
            >
              {t('demo.app.is_packaged')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Window APIs */}
      {activeSection === 'window' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('demo.window.title')}</CardTitle>
            <CardDescription>{t('demo.window.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => callAPI(
                async () => {
                  await window.electronAPI.window.minimize();
                  return { message: t('demo.window.msg_minimized') };
                },
                t('demo.window.minimize')
              )}
              disabled={loading}
            >
              {t('demo.window.minimize')}
            </Button>
            <Button
              onClick={() => callAPI(
                async () => {
                  await window.electronAPI.window.maximize();
                  return { message: t('demo.window.msg_maximized') };
                },
                t('demo.window.toggle_max')
              )}
              disabled={loading}
            >
              {t('demo.window.toggle_max')}
            </Button>
            {/* getBounds not exposed, using create/minimize/maximize/close available */}
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.window.getDisplay(),
                t('demo.window.get_display')
              )}
              disabled={loading}
            >
              {t('demo.window.get_display')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog APIs */}
      {activeSection === 'dialog' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('demo.dialog.title')}</CardTitle>
            <CardDescription>{t('demo.dialog.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.dialog.openFile({
                  title: t('demo.dialog.select_file'),
                  properties: ['openFile'],
                }),
                t('demo.dialog.open_file')
              )}
              disabled={loading}
            >
              {t('demo.dialog.open_file')}
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.dialog.showOpenDialog({
                  title: t('demo.dialog.select_folder'),
                  properties: ['openDirectory']
                }),
                t('demo.dialog.open_folder')
              )}
              disabled={loading}
            >
              {t('demo.dialog.open_folder')}
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.dialog.showSaveDialog({
                  title: t('demo.dialog.save_file_title'),
                  defaultPath: 'document.txt',
                }),
                t('demo.dialog.save_file')
              )}
              disabled={loading}
            >
              {t('demo.dialog.save_file')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Storage APIs */}
      {activeSection === 'storage' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('demo.storage.title')}</CardTitle>
            <CardDescription>{t('demo.storage.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder={t('demo.storage.key_placeholder')}
                value={storageKey}
                onChange={(e) => setStorageKey(e.target.value)}
              />
              <Input
                placeholder={t('demo.storage.value_placeholder')}
                value={storageValue}
                onChange={(e) => setStorageValue(e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                onClick={() => callAPI(
                  () => window.electronAPI.store.set(storageKey, storageValue),
                  t('demo.storage.action_set', { key: storageKey })
                )}
                disabled={loading || !storageKey}
              >
                {t('demo.storage.set_val')}
              </Button>
              <Button
                onClick={() => callAPI(
                  () => window.electronAPI.store.get(storageKey),
                  t('demo.storage.action_get', { key: storageKey })
                )}
                disabled={loading || !storageKey}
              >
                {t('demo.storage.get_val')}
              </Button>
              <Button
                onClick={() => callAPI(
                  () => window.electronAPI.store.delete(storageKey),
                  t('demo.storage.action_del', { key: storageKey })
                )}
                disabled={loading || !storageKey}
              >
                {t('demo.storage.del_val')}
              </Button>
              <Button
                onClick={() => callAPI(
                  () => window.electronAPI.store.has(storageKey),
                  t('demo.storage.action_has', { key: storageKey })
                )}
                disabled={loading || !storageKey}
              >
                {t('demo.storage.check_exists')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data APIs */}
      {activeSection === 'data' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('demo.data.title')}</CardTitle>
            <CardDescription>{t('demo.data.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.data.listBackups(),
                t('demo.data.list_backups')
              )}
              disabled={loading}
            >
              {t('demo.data.list_backups')}
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.data.createBackup({ includeDatabase: false } as any),
                t('demo.data.create_backup')
              )}
              disabled={loading}
            >
              {t('demo.data.create_backup')}
            </Button>
            {/* validateBackup not available */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
