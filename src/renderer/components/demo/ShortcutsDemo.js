import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Command, Check, X, WarningCircle, Trash } from '@phosphor-icons/react';
/**
 * ShortcutsDemo Component
 * Demonstrates global keyboard shortcuts functionality
 */
export default function ShortcutsDemo() {
    const [shortcuts, setShortcuts] = useState([]);
    const [newShortcut, setNewShortcut] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [status, setStatus] = useState('');
    const [triggerLog, setTriggerLog] = useState([]);
    useEffect(() => {
        // Listen for shortcut triggers
        const unsubscribe = window.electronAPI.shortcuts.onTriggered((data) => {
            const timestamp = new Date().toLocaleTimeString();
            setTriggerLog(prev => [
                { ...data, timestamp },
                ...prev.slice(0, 9) // Keep last 10
            ]);
        });
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, []);
    const registerShortcut = async () => {
        if (!newShortcut.trim()) {
            setStatus('Please enter a shortcut');
            return;
        }
        try {
            const label = newLabel.trim() || newShortcut;
            await window.electronAPI.shortcuts.register(newShortcut, label);
            setShortcuts([...shortcuts, { accelerator: newShortcut, label }]);
            setStatus(`Registered: ${newShortcut}`);
            setNewShortcut('');
            setNewLabel('');
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };
    const unregisterShortcut = async (accelerator) => {
        try {
            await window.electronAPI.shortcuts.unregister(accelerator);
            setShortcuts(shortcuts.filter(s => s.accelerator !== accelerator));
            setStatus(`Unregistered: ${accelerator}`);
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };
    const unregisterAll = async () => {
        try {
            await window.electronAPI.shortcuts.unregisterAll();
            setShortcuts([]);
            setStatus('All shortcuts unregistered');
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };
    const checkAvailability = async () => {
        if (!newShortcut.trim()) {
            setStatus('Please enter a shortcut to check');
            return;
        }
        try {
            const isAvailable = await window.electronAPI.shortcuts.isRegistered(newShortcut);
            setStatus(isAvailable ?
                `${newShortcut} is already registered` :
                `${newShortcut} is available`);
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };
    const commonShortcuts = [
        'CommandOrControl+Shift+K',
        'CommandOrControl+Shift+L',
        'Alt+Shift+A',
        'F1',
        'F2'
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Command, { className: "w-6 h-6 text-purple-600" }), _jsx("h2", { className: "text-2xl font-bold", children: "Global Shortcuts" })] }), status && (_jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2", children: [_jsx(WarningCircle, { className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-sm text-blue-800", children: status })] })), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3", children: "Register New Shortcut" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Accelerator" }), _jsx("input", { type: "text", value: newShortcut, onChange: (e) => setNewShortcut(e.target.value), placeholder: "e.g., CommandOrControl+Shift+K", className: "w-full px-3 py-2 border border-gray-300 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Label (optional)" }), _jsx("input", { type: "text", value: newLabel, onChange: (e) => setNewLabel(e.target.value), placeholder: "Description of the shortcut", className: "w-full px-3 py-2 border border-gray-300 rounded" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: registerShortcut, className: "flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2", children: [_jsx(Check, { className: "w-4 h-4" }), "Register"] }), _jsx("button", { onClick: checkAvailability, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "Check Available" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium mb-2", children: "Common Shortcuts:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: commonShortcuts.map((shortcut) => (_jsx("button", { onClick: () => setNewShortcut(shortcut), className: "px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded", children: shortcut }, shortcut))) })] })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h3", { className: "font-semibold", children: ["Registered Shortcuts (", shortcuts.length, ")"] }), shortcuts.length > 0 && (_jsxs("button", { onClick: unregisterAll, className: "px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1", children: [_jsx(Trash, { className: "w-4 h-4" }), "Clear All"] }))] }), shortcuts.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No shortcuts registered" })) : (_jsx("div", { className: "space-y-2", children: shortcuts.map((shortcut) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("code", { className: "text-sm font-mono bg-white px-2 py-1 rounded", children: shortcut.accelerator }), shortcut.label && (_jsx("p", { className: "text-sm text-gray-600 mt-1", children: shortcut.label }))] }), _jsx("button", { onClick: () => unregisterShortcut(shortcut.accelerator), className: "text-red-600 hover:text-red-800", children: _jsx(X, { className: "w-5 h-5" }) })] }, shortcut.accelerator))) }))] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3", children: "Shortcut Triggers (Last 10)" }), triggerLog.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No shortcuts triggered yet" })) : (_jsx("div", { className: "space-y-2", children: triggerLog.map((log, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm", children: [_jsxs("div", { children: [_jsx("code", { className: "font-mono", children: log.accelerator }), log.label && _jsxs("span", { className: "text-gray-600 ml-2", children: ["- ", log.label] })] }), _jsx("span", { className: "text-gray-500 text-xs", children: log.timestamp })] }, index))) }))] }), _jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Instructions:" }), _jsxs("ol", { className: "list-decimal list-inside space-y-1 text-sm", children: [_jsx("li", { children: "Enter a keyboard shortcut using Electron accelerator syntax" }), _jsx("li", { children: "Use CommandOrControl for cross-platform Cmd/Ctrl key" }), _jsx("li", { children: "Click \u201CRegister\u201D to activate the shortcut globally" }), _jsx("li", { children: "Press the shortcut anywhere (even when app is in background)" }), _jsx("li", { children: "Watch the trigger log update when shortcuts are activated" }), _jsx("li", { children: "Unregister shortcuts individually or clear all at once" })] }), _jsxs("div", { className: "mt-3 text-xs text-gray-600", children: [_jsx("p", { className: "font-semibold mb-1", children: "Modifiers:" }), _jsx("p", { children: "Command, Cmd, Control, Ctrl, Alt, Option, AltGr, Shift, Super, Meta" }), _jsx("p", { className: "font-semibold mt-2 mb-1", children: "Keys:" }), _jsx("p", { children: "A-Z, 0-9, F1-F24, Plus, Space, Tab, Backspace, Delete, Insert, Return, Enter, Up, Down, Left, Right, Home, End, PageUp, PageDown, Escape, Esc, VolumeUp, VolumeDown, VolumeMute, etc." })] })] })] }));
}
