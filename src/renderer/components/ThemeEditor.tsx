import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Button from './ui/Button';
import { useTranslation } from 'react-i18next';
import { hexToHsl, hslToHex } from '../utils/colors';

const ThemeEditor = () => {
  const { settings, updateSetting } = useSettings();
  const { t } = useTranslation();

  // Initial colors from existing custom theme or defaults
  // We keep internal state as HEX for the color picker
  const [colors, setColors] = useState({
    '--background': '#ffffff',
    '--foreground': '#0f172a',
    '--primary': '#0f172a',
    '--primary-foreground': '#f8fafc',
    '--muted': '#f1f5f9',
    '--muted-foreground': '#64748b',
    '--border': '#e2e8f0'
  });

  // Update local state when settings change (e.g. initial load)
  useEffect(() => {
    if (settings?.customThemes?.custom?.colors) {
      const loadedColors = {};
      Object.entries(settings.customThemes.custom.colors).forEach(([key, val]) => {
        // Convert stored HSL back to Hex for the inputs
        loadedColors[key] = val.startsWith('#') ? val : hslToHex(val);
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColors(prev => {
        const newColors = { ...prev, ...loadedColors };
        if (JSON.stringify(prev) !== JSON.stringify(newColors)) {
          return newColors;
        }
        return prev;
      });
    }
  }, [settings?.customThemes]);

  const handleChange = (key, value) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Convert all to HSL before saving
    const hslColors = {};
    Object.entries(colors).forEach(([key, val]) => {
      hslColors[key] = val.startsWith('#') ? hexToHsl(val) : val;
    });

    const newThemes = {
      ...settings.customThemes,
      custom: {
        name: 'Custom Theme',
        colors: hslColors
      }
    };
    updateSetting('customThemes', newThemes);
    updateSetting('appearance.theme', 'custom');
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-md bg-card text-card-foreground">
      <h3 className="font-semibold">{t('settings.appearance.theme_editor', 'Custom Theme Editor')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.keys(colors).map(key => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-mono">{key}</label>
            <div className="flex gap-2 items-center">
              <div className="relative w-8 h-8 rounded-md overflow-hidden border border-border shrink-0">
                <input
                  type="color"
                  value={colors[key].startsWith('#') ? colors[key] : '#000000'}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer p-0 m-0"
                />
              </div>
              <input
                type="text"
                value={colors[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="flex-1 text-xs px-2 py-1.5 border border-input rounded bg-background text-foreground font-mono"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={handleSave} size="sm">Save & Apply Custom Theme</Button>
      </div>
    </div>
  );
};

export default ThemeEditor;
