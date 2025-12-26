import { useState, useEffect } from 'react';
import { Tray, Check, X, WarningCircle, List } from '@phosphor-icons/react';

/**
 * TrayDemo Component
 * Demonstrates system tray functionality with dynamic menu management
 */
export default function TrayDemo() {
  const [trayExists, setTrayExists] = useState(false);
  const [status, setStatus] = useState('');
  const [tooltip, setTooltip] = useState('My Electron App');
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [menuItems, setMenuItems] = useState<any[]>([
    { id: 'show', label: 'Show Window', type: 'normal', enabled: true },
    { id: 'sep1', type: 'separator' },
    { id: 'quit', label: 'Quit', type: 'normal', enabled: true }
  ]);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const exists = await window.electronAPI.tray.checkStatus();
      setTrayExists(exists);
      if (exists) {
        setStatus('Tray detected (persisted from previous session/reload)');
      }
    } catch (error) {
      // console.error('Failed to check tray status', error);
    }
  };

  const createTray = async () => {
    try {
      const result = await window.electronAPI.tray.create();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create tray');
      }

      setTrayExists(true);
      setStatus('Tray created successfully! Check your system tray.');

      // Set up initial menu
      await updateContextMenu();
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
      setTrayExists(false);
    }
  };

  const destroyTray = async () => {
    try {
      await window.electronAPI.tray.destroy();
      setTrayExists(false);
      setStatus('Tray removed');
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  const updateContextMenu = async () => {
    try {
      const template = menuItems.map(item => ({
        id: item.id,
        label: item.label,
        type: item.type,
        enabled: item.enabled
      }));

      await window.electronAPI.tray.setContextMenu(template);
      setStatus('Menu updated');
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  const updateTooltip = async () => {
    try {
      await window.electronAPI.tray.setTooltip(tooltip);
      setStatus(`Tooltip updated to: ${tooltip}`);
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  const addMenuItem = () => {
    const newId = `item_${Date.now()}`;
    setMenuItems([
      ...menuItems.slice(0, -1), // All except quit
      { id: newId, label: 'New Item', type: 'normal', enabled: true },
      menuItems[menuItems.length - 1] // Add quit back at end
    ]);
  };

  const removeMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const toggleMenuItem = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const updateMenuItemLabel = (id: string, newLabel: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, label: newLabel } : item
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Tray className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Tray</h2>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        <button
          onClick={createTray}
          disabled={trayExists}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Create Tray
        </button>
        <button
          onClick={destroyTray}
          disabled={!trayExists}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Destroy Tray
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded flex items-start gap-2">
          <WarningCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">{status}</p>
        </div>
      )}
      {/* Status Icons */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Status Icons (Dynamic)</h3>
        <p className="text-sm text-gray-600 mb-3">Update the tray icon to reflect application state.</p>
        <div className="flex flex-wrap gap-2">
          {['normal', 'offline', 'error', 'sync'].map((s) => (
            <button
              key={s}
              onClick={async () => {
                try {
                  if (window.electronAPI.os?.setTrayStatus) {
                    await window.electronAPI.os.setTrayStatus(s);
                    setStatus(`Tray icon updated to: ${s}`);
                  } else {
                    setStatus('OS API not available');
                  }
                } catch (err) {
                  setStatus(`Error: ${(err as Error).message}`);
                }
              }}
              disabled={!trayExists}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 capitalized"
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tooltip Configuration */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Tooltip</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={tooltip}
            onChange={(e) => setTooltip(e.target.value)}
            placeholder="Tray tooltip"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
            disabled={!trayExists}
          />
          <button
            onClick={updateTooltip}
            disabled={!trayExists}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Update
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <List className="w-5 h-5" />
            Menu Items
          </h3>
          <button
            onClick={addMenuItem}
            disabled={!trayExists}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            + Add Item
          </button>
        </div>

        <div className="space-y-2 mb-3">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
            >
              {item.type === 'separator' ? (
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => toggleMenuItem(item.id)}
                    disabled={!trayExists}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateMenuItemLabel(item.id, e.target.value)}
                    disabled={!trayExists}
                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white placeholder-gray-400 disabled:text-gray-400"
                  />
                  {!['show', 'quit'].includes(item.id) && (
                    <button
                      onClick={() => removeMenuItem(item.id)}
                      disabled={!trayExists}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={updateContextMenu}
          disabled={!trayExists}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Apply Menu Changes
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click &ldquo;Create Tray&rdquo; to add an icon to your system tray</li>
          <li>Look for the tray icon in your menu bar (macOS) or system tray (Windows/Linux)</li>
          <li>Right-click the icon to see the context menu</li>
          <li>Modify menu items and click &ldquo;Apply Menu Changes&rdquo;</li>
          <li>Update the tooltip and hover over the tray icon to see it</li>
          <li>Click &ldquo;Destroy Tray&rdquo; to remove the icon</li>
        </ol>
      </div>
    </div>
  );
}
