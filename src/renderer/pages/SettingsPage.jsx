import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTab } from '../hooks/useTab';
import { useSettings } from '../contexts/SettingsContext';
import { useShortcutContext } from '../contexts/ShortcutContext';
import { useHistory } from '../contexts/HistoryContext';
import Button from '../components/ui/Button';
import Switch from '../components/ui/Switch';
import Label from '../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { cn } from '../utils/cn';

const SettingsPage = () => {
  const { settings, updateSetting, loading } = useSettings();
  const { userOverrides, importOverrides } = useShortcutContext();
  const { execute, undo, redo, canUndo, canRedo } = useHistory();
  const { t, i18n } = useTranslation('settings');
  const { openTab } = useTab();
  const [saveMessage, setSaveMessage] = useState('');
  const [testText, setTestText] = useState("");

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  const toggleTheme = () => {
    const newTheme = settings.appearance.theme === 'dark' ? 'light' : 'dark';
    updateSetting('appearance.theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  const changeLanguage = (lng) => {
    updateSetting('language', lng);
  };

  const handleExportSettings = async () => {
    try {
      // 1. Select save location
      const filePath = await window.electronAPI.dialog.showSaveDialog({
        defaultPath: 'settings-export.json',
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (!filePath) return;

      // 2. Export data (including shortcuts)
      const exportData = {
        settings,
        shortcuts: userOverrides
      };

      const result = await window.electronAPI.data.export(filePath, exportData);

      if (result.success) {
        setSaveMessage(`✓ Exported to ${result.filePath}`);
      } else {
        setSaveMessage(`✗ Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      setSaveMessage(`✗ Export error: ${error.message}`);
    } finally {
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleImportSettings = async () => {
    try {
      const result = await window.electronAPI.data.import({
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (result.success && result.data) {
        let importedCount = 0;

        // Import settings
        if (result.data.settings) {
          // Flatten/iterate settings to update context
          // Note context doesn't expose bulk update yet, so we iterate known keys or recursive
          // Just handling top level for now or specific keys we know of effectively
          // Improvements: Add bulkUpdate to SettingsContext
          // For now, let's just blindly update the structure
          Object.keys(result.data.settings).forEach(section => {
            if (typeof result.data.settings[section] === 'object') {
              Object.keys(result.data.settings[section]).forEach(key => {
                updateSetting(`${section}.${key}`, result.data.settings[section][key]);
              });
            } else {
              updateSetting(section, result.data.settings[section]);
            }
          });
          importedCount++;
        }

        // Import shortcuts
        if (result.data.shortcuts) {
          await importOverrides(result.data.shortcuts);
          importedCount++;
        }

        if (importedCount > 0) {
          setSaveMessage('✓ Settings imported successfully');
        } else {
          setSaveMessage('⚠ No valid settings found in file');
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      setSaveMessage(`✗ Import failed: ${error.message}`);
    } finally {
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleTestChange = (e) => {
    const newValue = e.target.value;
    const oldValue = testText;

    // Use execute to create undoable action
    execute({
      execute: () => setTestText(newValue),
      undo: () => setTestText(oldValue),
      label: 'Type text'
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('title', 'Settings')}</h1>
        <div className="flex gap-2">
          <Button onClick={handleImportSettings} variant="outline">
            Import Settings
          </Button>
          <Button onClick={handleExportSettings} variant="outline">
            Export Settings
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div className={cn(
          'p-3 rounded text-sm font-medium',
          saveMessage.startsWith('✓') ? 'bg-green-100 text-green-800' :
            saveMessage.startsWith('⚠') ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
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
              {settings.appearance.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
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

      {/* History & Undo */}
      <Card>
        <CardHeader>
          <CardTitle>History & Undo</CardTitle>
          <CardDescription>Manage undo/redo limits and test functionality.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Max Undo Steps</Label>
              <div className="text-sm text-muted-foreground">Maximum number of actions to keep in history</div>
            </div>
            <input
              type="number"
              className="w-20 p-2 border rounded bg-background"
              value={settings.history?.maxStackSize || 50}
              onChange={(e) => updateSetting('history.maxStackSize', parseInt(e.target.value) || 50)}
            />
          </div>

          <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
            <h4 className="text-sm font-semibold">Test Zone</h4>
            <div className="flex gap-2">
              <Button onClick={undo} disabled={!canUndo} variant="outline" size="sm">Undo (Cmd+Z)</Button>
              <Button onClick={redo} disabled={!canRedo} variant="outline" size="sm">Redo (Cmd+Shift+Z)</Button>
            </div>
            <input
              className="w-full p-2 border rounded bg-background"
              value={testText}
              onChange={handleTestChange}
              placeholder="Type here then Undo/Redo..."
            />
            <p className="text-xs text-muted-foreground">
              History Stack: {canUndo ? 'Has items' : 'Empty'} | Future Stack: {canRedo ? 'Has items' : 'Empty'}
            </p>
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
