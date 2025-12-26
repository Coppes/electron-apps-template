import { useState, useEffect } from 'react';
import { Command, Check, X, WarningCircle, Trash } from '@phosphor-icons/react';

/**
 * ShortcutsDemo Component
 * Demonstrates global keyboard shortcuts functionality
 */
interface ShortcutLog {
  timestamp: string;
  accelerator: string;
  label?: string;
}

interface RegisteredShortcut {
  accelerator: string;
  label?: string;
}

export default function ShortcutsDemo() {
  const [accelerator, setAccelerator] = useState('');
  const [label, setLabel] = useState('');
  const [status, setStatus] = useState('Ready');
  const [triggerLog, setTriggerLog] = useState<ShortcutLog[]>([]);
  const [registeredShortcuts, setRegisteredShortcuts] = useState<RegisteredShortcut[]>([]);

  useEffect(() => {
    // Listen for shortcut events from main process
    const removeListener = window.electronAPI.shortcuts.onTriggered((accelerator: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setStatus(`Shortcut pressed: ${accelerator}`);
      setTriggerLog(prev => [
        { accelerator, timestamp },
        ...prev.slice(0, 9)
      ]);
    });

    return () => {
      removeListener();
    };
  }, []);

  const registerShortcut = async () => {
    if (!accelerator.trim()) {
      setStatus('Please enter a shortcut');
      return;
    }

    try {
      const shortcutLabel = label.trim() || accelerator;
      // Cast to any if method signature doesn't match pending types
      await (window.electronAPI.shortcuts as any).register(accelerator, shortcutLabel);

      setRegisteredShortcuts(prev => [...prev, { accelerator, label: shortcutLabel }]);
      setStatus(`Registered: ${accelerator}`);
      setAccelerator('');
      setLabel('');
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  const unregisterShortcut = async (acc: string) => {
    try {
      await window.electronAPI.shortcuts.unregister(acc);
      setRegisteredShortcuts(prev => prev.filter(s => s.accelerator !== acc));
      setStatus(`Unregistered: ${acc}`);
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  const unregisterAll = async () => {
    try {
      await window.electronAPI.shortcuts.unregisterAll();
      setRegisteredShortcuts([]);
      setStatus('All shortcuts unregistered');
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  const checkAvailability = async () => {
    if (!accelerator.trim()) {
      setStatus('Please enter a shortcut to check');
      return;
    }

    try {
      const isAvailable = await window.electronAPI.shortcuts.isRegistered(accelerator);
      setStatus(isAvailable ?
        `${accelerator} is already registered` :
        `${accelerator} is available`
      );
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  const commonShortcuts = [
    'CommandOrControl+Shift+K',
    'CommandOrControl+Shift+L',
    'Alt+Shift+A',
    'F1',
    'F2'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Command className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Global Shortcuts</h2>
      </div>

      {/* Status */}
      {status && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2">
          <WarningCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">{status}</p>
        </div>
      )}

      {/* Register New Shortcut */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Register New Shortcut</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Accelerator</label>
            <input
              type="text"
              value={accelerator}
              onChange={(e) => setAccelerator(e.target.value)}
              placeholder="e.g., CommandOrControl+Shift+K"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Label (optional)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Description of the shortcut"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={registerShortcut}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Register
            </button>
            <button
              onClick={checkAvailability}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Check Available
            </button>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Common Shortcuts:</p>
            <div className="flex flex-wrap gap-2">
              {commonShortcuts.map((shortcut) => (
                <button
                  key={shortcut}
                  onClick={() => setAccelerator(shortcut)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {shortcut}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Registered Shortcuts */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Registered Shortcuts ({registeredShortcuts.length})</h3>
          {registeredShortcuts.length > 0 && (
            <button
              onClick={unregisterAll}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
            >
              <Trash className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {registeredShortcuts.length === 0 ? (
          <p className="text-gray-500 text-sm">No shortcuts registered</p>
        ) : (
          <div className="space-y-2">
            {registeredShortcuts.map((shortcut) => (
              <div
                key={shortcut.accelerator}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded">
                    {shortcut.accelerator}
                  </code>
                  {shortcut.label && (
                    <p className="text-sm text-gray-600 mt-1">{shortcut.label}</p>
                  )}
                </div>
                <button
                  onClick={() => unregisterShortcut(shortcut.accelerator)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trigger Log */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Shortcut Triggers (Last 10)</h3>
        {triggerLog.length === 0 ? (
          <p className="text-gray-500 text-sm">No shortcuts triggered yet</p>
        ) : (
          <div className="space-y-2">
            {triggerLog.map((log, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm"
              >
                <div>
                  <code className="font-mono">{log.accelerator}</code>
                  {log.label && <span className="text-gray-600 ml-2">- {log.label}</span>}
                </div>
                <span className="text-gray-500 text-xs">{log.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Enter a keyboard shortcut using Electron accelerator syntax</li>
          <li>Use CommandOrControl for cross-platform Cmd/Ctrl key</li>
          <li>Click &ldquo;Register&rdquo; to activate the shortcut globally</li>
          <li>Press the shortcut anywhere (even when app is in background)</li>
          <li>Watch the trigger log update when shortcuts are activated</li>
          <li>Unregister shortcuts individually or clear all at once</li>
        </ol>
        <div className="mt-3 text-xs text-gray-600">
          <p className="font-semibold mb-1">Modifiers:</p>
          <p>Command, Cmd, Control, Ctrl, Alt, Option, AltGr, Shift, Super, Meta</p>
          <p className="font-semibold mt-2 mb-1">Keys:</p>
          <p>A-Z, 0-9, F1-F24, Plus, Space, Tab, Backspace, Delete, Insert, Return, Enter, Up, Down, Left, Right, Home, End, PageUp, PageDown, Escape, Esc, VolumeUp, VolumeDown, VolumeMute, etc.</p>
        </div>
      </div>
    </div>
  );
}
