import React from 'react';
import { useShortcutContext } from '../../contexts/ShortcutContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'; // Assuming Card UI exists or using plain HTML if not
// Assuming we have Shadcn UI components installed, if not fallback to basic HTML
// Earlier checks showed Shadcn installation (Task 11 of bootstrap).

const KeyboardShortcutsPage = () => {
  const { shortcuts } = useShortcutContext();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Keyboard Shortcuts</h1>

      <div className="grid gap-4">
        {shortcuts.length === 0 ? (
          <p className="text-muted-foreground">No active shortcuts registered.</p>
        ) : (
          shortcuts.map((shortcut) => (
            <div
              key={shortcut.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card"
            >
              <div>
                <h3 className="font-semibold">{shortcut.description || shortcut.id}</h3>
                <code className="text-xs text-muted-foreground">{shortcut.id}</code>
              </div>
              <div className="flex items-center gap-1">
                {shortcut.keys.split('+').map((key, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border"
                  >
                    {key.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KeyboardShortcutsPage;
