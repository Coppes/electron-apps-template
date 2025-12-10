import React, { useState } from 'react';
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
  const [activeSection, setActiveSection] = useState('app');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storageKey, setStorageKey] = useState('demo-key');
  const [storageValue, setStorageValue] = useState('demo-value');

  const callAPI = async (apiCall, description) => {
    try {
      setLoading(true);
      setResult({ type: 'loading', text: `Calling ${description}...` });
      const data = await apiCall();
      setResult({ type: 'success', data, description });
    } catch (error) {
      setResult({ type: 'error', text: error.message, description });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'app', label: 'App APIs', icon: Monitor },
    { id: 'window', label: 'Window APIs', icon: Cards },
    { id: 'dialog', label: 'Dialog APIs', icon: Chat },
    { id: 'storage', label: 'Storage APIs', icon: Lock },
    { id: 'data', label: 'Data APIs', icon: FloppyDisk },
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
            <CardTitle>Result: {result.description}</CardTitle>
          </CardHeader>
          <CardContent>
            {result.type === 'loading' && (
              <div className="text-muted-foreground">{result.text}</div>
            )}
            {result.type === 'error' && (
              <div className="text-red-600">Error: {result.text}</div>
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
            <CardTitle>App APIs</CardTitle>
            <CardDescription>Application-level information and controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.app.getVersion(),
                'Get Version'
              )}
              disabled={loading}
            >
              Get App Version
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.app.getPath('userData'),
                'Get User Data Path'
              )}
              disabled={loading}
            >
              Get User Data Path
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.app.getPlatform(),
                'Get Platform'
              )}
              disabled={loading}
            >
              Get Platform
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.app.isPackaged(),
                'Check If Packaged'
              )}
              disabled={loading}
            >
              Is Packaged?
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Window APIs */}
      {activeSection === 'window' && (
        <Card>
          <CardHeader>
            <CardTitle>Window APIs</CardTitle>
            <CardDescription>Window management and controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => callAPI(
                async () => {
                  await window.electronAPI.window.minimize();
                  return { message: 'Window minimized' };
                },
                'Minimize Window'
              )}
              disabled={loading}
            >
              Minimize Window
            </Button>
            <Button
              onClick={() => callAPI(
                async () => {
                  await window.electronAPI.window.toggleMaximize();
                  return { message: 'Window toggled maximize' };
                },
                'Toggle Maximize'
              )}
              disabled={loading}
            >
              Toggle Maximize
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.window.getBounds(),
                'Get Window Bounds'
              )}
              disabled={loading}
            >
              Get Window Bounds
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.window.getDisplay(),
                'Get Display Info'
              )}
              disabled={loading}
            >
              Get Display Info
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog APIs */}
      {activeSection === 'dialog' && (
        <Card>
          <CardHeader>
            <CardTitle>Dialog APIs</CardTitle>
            <CardDescription>System dialogs for file and folder selection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.dialog.openFile({
                  title: 'Select a file',
                  properties: ['openFile'],
                }),
                'Open File Dialog'
              )}
              disabled={loading}
            >
              Open File Dialog
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.dialog.openFolder({
                  title: 'Select a folder',
                }),
                'Open Folder Dialog'
              )}
              disabled={loading}
            >
              Open Folder Dialog
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.dialog.saveFile({
                  title: 'Save file',
                  defaultPath: 'document.txt',
                }),
                'Save File Dialog'
              )}
              disabled={loading}
            >
              Save File Dialog
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Storage APIs */}
      {activeSection === 'storage' && (
        <Card>
          <CardHeader>
            <CardTitle>Storage APIs</CardTitle>
            <CardDescription>Secure storage operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Key"
                value={storageKey}
                onChange={(e) => setStorageKey(e.target.value)}
              />
              <Input
                placeholder="Value"
                value={storageValue}
                onChange={(e) => setStorageValue(e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                onClick={() => callAPI(
                  () => window.electronAPI.store.set(storageKey, storageValue),
                  `Set '${storageKey}'`
                )}
                disabled={loading || !storageKey}
              >
                Set Value
              </Button>
              <Button
                onClick={() => callAPI(
                  () => window.electronAPI.store.get(storageKey),
                  `Get '${storageKey}'`
                )}
                disabled={loading || !storageKey}
              >
                Get Value
              </Button>
              <Button
                onClick={() => callAPI(
                  () => window.electronAPI.store.delete(storageKey),
                  `Delete '${storageKey}'`
                )}
                disabled={loading || !storageKey}
              >
                Delete Value
              </Button>
              <Button
                onClick={() => callAPI(
                  () => window.electronAPI.store.has(storageKey),
                  `Has '${storageKey}'`
                )}
                disabled={loading || !storageKey}
              >
                Check If Exists
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data APIs */}
      {activeSection === 'data' && (
        <Card>
          <CardHeader>
            <CardTitle>Data APIs</CardTitle>
            <CardDescription>Data management operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.data.listBackups(),
                'List Backups'
              )}
              disabled={loading}
            >
              List Backups
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.data.createBackup({ includeSecureStorage: false }),
                'Create Backup'
              )}
              disabled={loading}
            >
              Create Backup
            </Button>
            <Button
              onClick={() => callAPI(
                () => window.electronAPI.data.validateBackup({ filename: 'latest' }),
                'Validate Latest Backup'
              )}
              disabled={loading}
            >
              Validate Backup
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
