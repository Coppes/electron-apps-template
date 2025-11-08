import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Label from '../ui/Label';
import Switch from '../ui/Switch';
import Select from '../ui/Select';
import Separator from '../ui/Separator';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    theme: 'system',
    notifications: true,
    autoStart: false,
    language: 'pt-BR',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (window.electronAPI?.store) {
        const savedSettings = await window.electronAPI.store.get('settings');
        if (savedSettings) {
          setSettings(savedSettings);
        }
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      if (window.electronAPI?.store) {
        await window.electronAPI.store.set('settings', settings);
        setSaveMessage('✓ Settings saved successfully!');
      } else {
        setSaveMessage('⚠ Store API not available');
      }
    } catch (error) {
      setSaveMessage(`✗ Error saving: ${error.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred color theme
                </p>
              </div>
              <Select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
                className="w-32"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive desktop notifications
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSetting('notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
            <CardDescription>
              System and startup settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Start</Label>
                <p className="text-sm text-muted-foreground">
                  Launch app on system startup
                </p>
              </div>
              <Switch
                checked={settings.autoStart}
                onCheckedChange={(checked) => updateSetting('autoStart', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Language</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
              <Select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="w-32"
              >
                <option value="en-US">English</option>
                <option value="pt-BR">Português</option>
                <option value="es-ES">Español</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div>
            {saveMessage && (
              <span className={cn(
                'text-sm',
                saveMessage.startsWith('✓') && 'text-green-600',
                saveMessage.startsWith('✗') && 'text-red-600',
                saveMessage.startsWith('⚠') && 'text-yellow-600'
              )}>
                {saveMessage}
              </span>
            )}
          </div>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
