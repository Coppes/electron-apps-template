import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    const [menuItems, setMenuItems] = useState([
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
        }
        catch (error) {
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
            await updateMenu();
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
            setTrayExists(false);
        }
    };
    const destroyTray = async () => {
        try {
            await window.electronAPI.tray.destroy();
            setTrayExists(false);
            setStatus('Tray removed');
        }
        catch (error) {
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
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };
    const updateTooltip = async () => {
        try {
            await window.electronAPI.tray.setTooltip(tooltip);
            setStatus(`Tooltip updated to: ${tooltip}`);
        }
        catch (error) {
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
        setMenuItems(menuItems.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item));
    };
    const updateMenuItemLabel = (id, newLabel) => {
        setMenuItems(menuItems.map(item => item.id === id ? { ...item, label: newLabel } : item));
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Tray, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "System Tray" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { onClick: createTray, disabled: trayExists, className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4" }), "Create Tray"] }), _jsxs("button", { onClick: destroyTray, disabled: !trayExists, className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2", children: [_jsx(X, { className: "w-4 h-4" }), "Destroy Tray"] })] }), status && (_jsxs("div", { className: "p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded flex items-start gap-2", children: [_jsx(WarningCircle, { className: "w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-sm text-blue-800 dark:text-blue-200", children: status })] })), _jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3 text-gray-900 dark:text-white", children: "Status Icons (Dynamic)" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Update the tray icon to reflect application state." }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['normal', 'offline', 'error', 'sync'].map((s) => (_jsx("button", { onClick: async () => {
                                try {
                                    if (window.electronAPI.os?.setTrayStatus) {
                                        await window.electronAPI.os.setTrayStatus(s);
                                        setStatus(`Tray icon updated to: ${s}`);
                                    }
                                    else {
                                        setStatus('OS API not available');
                                    }
                                }
                                catch (err) {
                                    setStatus(`Error: ${err.message}`);
                                }
                            }, disabled: !trayExists, className: "px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 capitalized", children: s.charAt(0).toUpperCase() + s.slice(1) }, s))) })] }), _jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3 text-gray-900 dark:text-white", children: "Tooltip" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: tooltip, onChange: (e) => setTooltip(e.target.value), placeholder: "Tray tooltip", className: "flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400", disabled: !trayExists }), _jsx("button", { onClick: updateTooltip, disabled: !trayExists, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400", children: "Update" })] })] }), _jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h3", { className: "font-semibold flex items-center gap-2 text-gray-900 dark:text-white", children: [_jsx(List, { className: "w-5 h-5" }), "Menu Items"] }), _jsx("button", { onClick: addMenuItem, disabled: !trayExists, className: "px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400", children: "+ Add Item" })] }), _jsx("div", { className: "space-y-2 mb-3", children: menuItems.map((item) => (_jsx("div", { className: "flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700", children: item.type === 'separator' ? (_jsx("div", { className: "flex-1 border-t border-gray-300 dark:border-gray-600" })) : (_jsxs(_Fragment, { children: [_jsx("input", { type: "checkbox", checked: item.enabled, onChange: () => toggleMenuItem(item.id), disabled: !trayExists, className: "w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700" }), _jsx("input", { type: "text", value: item.label, onChange: (e) => updateMenuItemLabel(item.id, e.target.value), disabled: !trayExists, className: "flex-1 bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white placeholder-gray-400 disabled:text-gray-400" }), !['show', 'quit'].includes(item.id) && (_jsx("button", { onClick: () => removeMenuItem(item.id), disabled: !trayExists, className: "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:text-gray-400", children: _jsx(X, { className: "w-4 h-4" }) }))] })) }, item.id))) }), _jsx("button", { onClick: updateMenu, disabled: !trayExists, className: "w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400", children: "Apply Menu Changes" })] }), _jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Instructions:" }), _jsxs("ol", { className: "list-decimal list-inside space-y-1 text-sm", children: [_jsx("li", { children: "Click \u201CCreate Tray\u201D to add an icon to your system tray" }), _jsx("li", { children: "Look for the tray icon in your menu bar (macOS) or system tray (Windows/Linux)" }), _jsx("li", { children: "Right-click the icon to see the context menu" }), _jsx("li", { children: "Modify menu items and click \u201CApply Menu Changes\u201D" }), _jsx("li", { children: "Update the tooltip and hover over the tray icon to see it" }), _jsx("li", { children: "Click \u201CDestroy Tray\u201D to remove the icon" })] })] })] }));
}
