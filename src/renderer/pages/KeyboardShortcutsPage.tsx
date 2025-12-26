import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useShortcutContext } from '../contexts/ShortcutContext';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

interface ShortcutRecorderProps {
  value: string;
  onSave: (keys: string) => void;
  onCancel: () => void;
  hasError: boolean;
}

// Simple key recorder component
const ShortcutRecorder = ({ value, onSave, onCancel, hasError }: ShortcutRecorderProps) => {
  const { t } = useTranslation('common');
  const [keys, setKeys] = useState(value || '');
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const pressed: string[] = [];
      if (e.ctrlKey) pressed.push('Ctrl');
      if (e.metaKey) pressed.push('Cmd');
      if (e.altKey) pressed.push('Alt');
      if (e.shiftKey) pressed.push('Shift');

      // Don't record only modifiers
      if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
        // just update display if needed, but here we wait for non-modifier
        return;
      }

      pressed.push(e.key.toUpperCase());
      const combo = pressed.join('+');

      setKeys(combo);
      setRecording(false); // Stop after one combo
      onSave(combo);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recording, onSave]);

  return (
    <div className="flex items-center gap-2">
      <div
        onClick={() => !recording && setRecording(true)}
        className={`px-3 py-1 rounded border cursor-pointer select-none min-w-[100px] text-center
          ${hasError ? 'border-destructive text-destructive bg-destructive/10' : 'bg-muted border-input'}
          ${recording ? 'border-primary ring-1 ring-primary animate-pulse bg-background' : ''}
        `}
        title={hasError ? t('shortcuts.invalid') : t('shortcuts.record_tooltip')}
      >
        {recording ? t('shortcuts.press_keys') : (keys || t('shortcuts.press_keys'))}
      </div>
      <Button size="sm" variant="ghost" onClick={onCancel}>{t('shortcuts.cancel')}</Button>
    </div>
  );
};

const KeyboardShortcutsPage = () => {
  const { t } = useTranslation('common');
  const { shortcuts, updateShortcut, resetToDefaults, userOverrides } = useShortcutContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (id: string, newKeys: string) => {
    try {
      if (updateShortcut) {
        await updateShortcut(id, newKeys);
      }
      setEditingId(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('nav.items.settings')} / {t('shortcuts.title')}</h1>
          <p className="text-muted-foreground">{t('shortcuts.subtitle')}</p>
        </div>
        <Button variant="outline" onClick={resetToDefaults}>{t('shortcuts.reset')}</Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {shortcuts.map((shortcut) => {
              const currentKeys = userOverrides?.[shortcut.id] || shortcut.keys;
              const isEditing = editingId === shortcut.id;

              return (
                <div key={shortcut.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-medium">{(shortcut as any).description || shortcut.id}</div>
                    <div className="text-xs text-muted-foreground font-mono">{shortcut.id}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isEditing ? (
                      <ShortcutRecorder
                        value={currentKeys}
                        onSave={(k) => handleUpdate(shortcut.id, k)}
                        onCancel={() => { setEditingId(null); setError(null); }}
                        hasError={!!error}
                      />
                    ) : (
                      <button
                        onClick={() => setEditingId(shortcut.id)}
                        className="px-3 py-1 bg-secondary hover:bg-secondary/80 rounded border border-border text-sm font-mono min-w-[100px] text-center transition-colors"
                        title="Click to edit"
                      >
                        {currentKeys}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {shortcuts.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                {t('shortcuts.no_shortcuts')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyboardShortcutsPage;
