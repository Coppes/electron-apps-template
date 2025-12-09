import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTab } from '../../hooks/useTab';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import Label from '../ui/Label';
import Select from '../ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { cn } from '../../utils/cn';

const SettingsPage = () => {
  const [theme, setTheme] = useState('dark');
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    autoStart: false,
    language: 'en',
  });
  const { t, i18n } = useTranslation('settings');
  const { openTab } = useTab();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      // Load local theme
      const savedTheme = localStorage.getItem('theme') || 'dark';
      setTheme(savedTheme);

      // Load electron store settings
      if (window.electronAPI?.store) {
        try {
          const saved = await window.electronAPI.store.get('settings');
          if (saved) {
            setSettings(prev => ({ ...prev, ...saved }));
            // Sync language if saved
            if (saved.language && saved.language !== i18n.language) {
              try {
                if (window.electronAPI.i18n) {
                  await window.electronAPI.i18n.changeLanguage(saved.language);
                }
              } catch (error) {
                console.error('Failed to save language:', error);
              }
              await i18n.changeLanguage(saved.language);
            }
          }
        } catch (e) {
          console.error("Failed to load settings", e);
        }
      }
    };
    loadSettings();
  }, [i18n]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
    updateSetting('theme', newTheme);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    updateSetting('language', lng);
    // Persist via IPC if needed for main process
    try {
      window.electronAPI.invoke('i18n:set-language', { language: lng });
    } catch (e) {
      console.error("Failed to sync language to main", e);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      if (window.electronAPI?.store) {
        await window.electronAPI.store.set('settings', settings);
        setSaveMessage('✓ Settings saved successfully!');
      } else {
        // Fallback for demo/dev without electron API
        console.warn('Store API not available');
        setSaveMessage('✓ Settings saved (local session only)');
      }
    } catch (error) {
      setSaveMessage(`✗ Error saving: ${error.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('title', 'Settings')}</h1>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      {saveMessage && (
        <div className={cn(
          'p-3 rounded text-sm font-medium',
          saveMessage.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        )}>
          {saveMessage}
        </div>
      )}

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>{t('appearance.title', 'Appearance')}</CardTitle>
          <CardDescription>{t('appearance.description', 'Customize the look and feel.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>{t('appearance.theme', 'Theme')}</span>
            <Button onClick={toggleTheme} variant="outline">
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle>{t('language.title', 'Language')}</CardTitle>
          <CardDescription>{t('language.description', 'Select display language.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={settings.language === 'en' ? 'default' : 'outline'}
              onClick={() => changeLanguage('en')}
            >
              English
            </Button>
            <Button
              variant={settings.language === 'pt-BR' ? 'default' : 'outline'}
              onClick={() => changeLanguage('pt-BR')}
            >
              Português (Brasil)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>{t('shortcuts.title', 'Keyboard Shortcuts')}</CardTitle>
          <CardDescription>{t('shortcuts.description', 'View and customize keyboard shortcuts.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => openTab({ id: 'shortcuts', title: 'Shortcuts', type: 'shortcuts' })}>
            View Shortcuts
          </Button>
        </CardContent>
      </Card>

      {/* System */}
      <Card>
        <CardHeader>
          <CardTitle>{t('system.title', 'System')}</CardTitle>
          <CardDescription>{t('system.description', 'System configurations.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications</Label>
              <div className="text-sm text-muted-foreground">Enable desktop notifications</div>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Start</Label>
              <div className="text-sm text-muted-foreground">Launch on system startup</div>
            </div>
            <Switch
              checked={settings.autoStart}
              onCheckedChange={(checked) => updateSetting('autoStart', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t('data.title', 'Data Management')}</CardTitle>
          <CardDescription>{t('data.description', 'Manage your application data.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  // 1. Select file
                  const filePath = await window.electronAPI.dialog.showOpenDialog({
                    filters: [
                      { name: 'Data', extensions: ['json', 'csv'] },
                      { name: 'All Files', extensions: ['*'] }
                    ],
                    properties: ['openFile']
                  });

                  if (!filePath) return;

                  // 2. Import data
                  setSaveMessage('⏳ Importing data...');
                  const result = await window.electronAPI.data.import(filePath);

                  if (result.success) {
                    setSaveMessage(`✓ Imported ${result.count} records successfully!`);
                  } else {
                    setSaveMessage(`✗ Import failed: ${result.error}`);
                  }
                } catch (error) {
                  console.error('Import error:', error);
                  setSaveMessage(`✗ Import error: ${error.message}`);
                }
              }}
            >
              Import Data
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  // 1. Get all store data to export (or specific subsets)
                  // For this demo, we can export specific keys or rely on the main process handler 
                  // to gather data if 'data' param is omitted/handled there?
                  // The error log said 'data' is required.
                  // Let's assume we want to export 'settings' for now as a test.
                  const dataToExport = {
                    settings: await window.electronAPI.store.get('settings'),
                    // Add other data as needed
                  };

                  // 2. Select save location
                  const filePath = await window.electronAPI.dialog.showSaveDialog({
                    defaultPath: 'export.json',
                    filters: [
                      { name: 'JSON', extensions: ['json'] },
                      { name: 'CSV', extensions: ['csv'] }
                    ]
                  });

                  if (!filePath) return;

                  // 3. Export data
                  setSaveMessage('⏳ Exporting data...');
                  // We pass the data to export. 
                  const result = await window.electronAPI.data.export(filePath, dataToExport);

                  if (result.success) {
                    setSaveMessage(`✓ Exported to ${result.filePath}`);
                  } else {
                    setSaveMessage(`✗ Export failed: ${result.error}`);
                  }
                } catch (error) {
                  console.error('Export error:', error);
                  setSaveMessage(`✗ Export error: ${error.message}`);
                }
              }}
            >
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>{t('about.title', 'About')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
