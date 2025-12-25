import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useDock } from '../../hooks/useDock';
import { usePowerMonitor } from '../../hooks/usePowerMonitor';
import { Lightning, AppWindow } from '@phosphor-icons/react';
export default function DockPowerDemo() {
    const { setBadge } = useDock();
    const { status: powerStatus, lastEventTime } = usePowerMonitor();
    const [badgeText, setBadgeText] = useState('');
    const handleSetBadge = async () => {
        await setBadge(badgeText);
    };
    const handleClearBadge = async () => {
        setBadgeText('');
        await setBadge('');
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(AppWindow, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Dock & Taskbar" })] }), _jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3 text-gray-900 dark:text-white", children: "App Badge" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Set a text badge on the application dock icon (macOS) or taskbar (Windows overlays)." }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: badgeText, onChange: (e) => setBadgeText(e.target.value), placeholder: "Badge text (e.g. 1, \u25CF)", className: "flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white" }), _jsx("button", { onClick: handleSetBadge, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "Set Badge" }), _jsx("button", { onClick: handleClearBadge, className: "px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600", children: "Clear" })] })] }), _jsxs("div", { className: "flex items-center gap-2 mb-4 mt-8", children: [_jsx(Lightning, { className: "w-6 h-6 text-yellow-600 dark:text-yellow-400" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Power Monitor" })] }), _jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 font-medium uppercase tracking-wide", children: "Current Status" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white mt-1 capitalize", children: powerStatus === 'unknown' ? 'Waiting for change...' : powerStatus })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 font-medium uppercase tracking-wide", children: "Last Event" }), _jsx("p", { className: "text-lg text-gray-900 dark:text-white mt-1", children: lastEventTime ? lastEventTime.toLocaleTimeString() : 'None' })] })] }), _jsx("div", { className: "mt-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: _jsx("p", { className: "text-sm text-gray-600", children: "Try unplugging power cable, or putting system to sleep/suspend to see updates." }) })] })] }));
}
