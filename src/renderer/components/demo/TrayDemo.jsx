import { useState } from 'react';
import { Inbox, Check, X, AlertCircle, Menu } from 'react-feather';

/**
 * TrayDemo Component
 * Demonstrates system tray functionality with dynamic menu management
 */
export default function TrayDemo() {
  const [trayExists, setTrayExists] = useState(false);
  const [status, setStatus] = useState('');
  const [tooltip, setTooltip] = useState('My Electron App');
  const [menuItems, setMenuItems] = useState([
    { id: 'show', label: 'Show Window', type: 'normal', enabled: true },
    { id: 'sep1', type: 'separator' },
    { id: 'quit', label: 'Quit', type: 'normal', enabled: true }
  ]);

  const createTray = async () => {
    try {
      await window.electronAPI.tray.create();
      setTrayExists(true);
      setStatus('Tray created successfully! Check your system tray.');
      
      // Set up initial menu
      await updateMenu();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const destroyTray = async () => {
    try {
      await window.electronAPI.tray.destroy();
      setTrayExists(false);
      setStatus('Tray removed');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const updateMenu = async () => {
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
      setStatus(`Error: ${error.message}`);
    }
  };

  const updateTooltip = async () => {
    try {
      await window.electronAPI.tray.setTooltip(tooltip);
      setStatus(`Tooltip updated to: ${tooltip}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
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

  const removeMenuItem = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const toggleMenuItem = (id) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Inbox className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">System Tray</h2>
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
        <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">{status}</p>
        </div>
      )}

      {/* Tooltip Configuration */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Tooltip</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={tooltip}
            onChange={(e) => setTooltip(e.target.value)}
            placeholder="Tray tooltip"
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
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
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Menu className="w-5 h-5" />
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
              className="flex items-center gap-2 p-2 bg-gray-50 rounded"
            >
              {item.type === 'separator' ? (
                <div className="flex-1 border-t border-gray-300"></div>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => toggleMenuItem(item.id)}
                    disabled={!trayExists}
                    className="w-4 h-4"
                  />
                  <span className="flex-1">{item.label}</span>
                  {!['show', 'quit'].includes(item.id) && (
                    <button
                      onClick={() => removeMenuItem(item.id)}
                      disabled={!trayExists}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400"
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
          onClick={updateMenu}
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
