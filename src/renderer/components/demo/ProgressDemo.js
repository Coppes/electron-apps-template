import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Pulse, Play, Pause, StopCircle, ArrowClockwise } from '@phosphor-icons/react';
/**
 * ProgressDemo Component
 * Demonstrates taskbar/dock progress indicators
 */
export default function ProgressDemo() {
    const [progress, setProgress] = useState(0);
    const [mode, setMode] = useState('normal');
    const [isSimulating, setIsSimulating] = useState(false);
    const [status, setStatus] = useState('');
    const updateProgress = async (value, state = 'normal') => {
        try {
            await window.electronAPI.progress.set(value, state);
            setStatus(`Progress: ${Math.round(value * 100)}% (${state})`);
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };
    const clearProgress = async () => {
        try {
            await window.electronAPI.progress.clear();
            setProgress(0);
            setIsSimulating(false);
            setStatus('Progress cleared');
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };
    const startSimulation = async () => {
        setProgress(0);
        setIsSimulating(true);
        // Simulate progress over time
        for (let i = 0; i <= 20; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const value = i / 20;
            setProgress(value);
            await updateProgress(value, mode);
        }
        setIsSimulating(false);
    };
    const pauseSimulation = () => {
        setIsSimulating(false);
    };
    const setIndeterminate = async () => {
        try {
            await window.electronAPI.progress.set(-1, mode);
            setProgress(-1);
            setStatus('Indeterminate progress (spinning)');
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };
    const modes = [
        { value: 'normal', label: 'Normal', color: 'blue' },
        { value: 'indeterminate', label: 'Indeterminate', color: 'purple' },
        { value: 'error', label: 'Error', color: 'red' },
        { value: 'paused', label: 'Paused', color: 'yellow' }
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-6", children: [_jsx("div", { className: "p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg", children: _jsx(Pulse, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }) }), _jsx("h2", { className: "text-2xl font-bold", children: "Progress Indicator" })] }), status && (_jsx("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded", children: _jsx("p", { className: "text-sm text-blue-800", children: status }) })), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3", children: "Current Progress" }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-6 overflow-hidden", children: progress === -1 ? (_jsx("div", { className: "h-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-pulse" })) : (_jsx("div", { className: `h-full transition-all duration-200 ${mode === 'error' ? 'bg-red-600' :
                                        mode === 'paused' ? 'bg-yellow-500' :
                                            'bg-blue-600'}`, style: { width: `${progress * 100}%` } })) }), _jsx("p", { className: "text-center text-2xl font-bold", children: progress === -1 ? '∞' : `${Math.round(progress * 100)}%` })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3", children: "Controls" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { onClick: startSimulation, disabled: isSimulating, className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2", children: [_jsx(Play, { className: "w-4 h-4" }), "Start Simulation"] }), _jsxs("button", { onClick: pauseSimulation, disabled: !isSimulating, className: "px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 flex items-center justify-center gap-2", children: [_jsx(Pause, { className: "w-4 h-4" }), "Pause"] }), _jsxs("button", { onClick: setIndeterminate, className: "px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center gap-2", children: [_jsx(ArrowClockwise, { className: "w-4 h-4" }), "Indeterminate"] }), _jsxs("button", { onClick: clearProgress, className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2", children: [_jsx(StopCircle, { className: "w-4 h-4" }), "Clear"] })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3", children: "Manual Control" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: ["Progress Value: ", Math.round(progress * 100), "%"] }), _jsx("input", { type: "range", min: "0", max: "100", value: Math.round(progress * 100), onChange: async (e) => {
                                            const value = parseFloat(e.target.value) / 100;
                                            setProgress(value);
                                            await updateProgress(value, mode);
                                        }, disabled: isSimulating, className: "w-full" })] }), _jsx("div", { className: "grid grid-cols-4 gap-2", children: [0, 0.25, 0.5, 0.75, 1].map((value) => (_jsxs("button", { onClick: async () => {
                                        setProgress(value);
                                        await updateProgress(value, mode);
                                    }, disabled: isSimulating, className: "px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:bg-gray-50", children: [Math.round(value * 100), "%"] }, value))) })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3", children: "Progress Mode" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: modes.map((m) => (_jsx("button", { onClick: () => setMode(m.value), className: `px-4 py-2 rounded border-2 transition-all ${mode === m.value
                                ? `border-${m.color}-600 bg-${m.color}-50`
                                : 'border-gray-200 hover:border-gray-300'}`, children: _jsx("span", { className: `font-medium ${mode === m.value ? `text-${m.color}-700` : 'text-gray-700'}`, children: m.label }) }, m.value))) }), _jsx("p", { className: "text-xs text-gray-600 mt-3", children: "Note: Windows shows different colors for different modes. macOS and Linux may not show visual differences." })] }), _jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Instructions:" }), _jsxs("ol", { className: "list-decimal list-inside space-y-1 text-sm", children: [_jsx("li", { children: "Look at your taskbar (Windows) or dock (macOS) icon" }), _jsx("li", { children: "Click \u201CStart Simulation\u201D to see progress animate automatically" }), _jsx("li", { children: "Try different modes to see visual changes (Windows shows colors)" }), _jsx("li", { children: "Use manual slider to set specific progress values" }), _jsx("li", { children: "Click \u201CIndeterminate\u201D for spinning/bouncing progress" }), _jsx("li", { children: "Click \u201CClear\u201D to remove the progress indicator" })] }), _jsx("div", { className: "mt-3 pt-3 border-t border-yellow-300", children: _jsxs("p", { className: "text-xs text-gray-700", children: [_jsx("strong", { children: "Platform Differences:" }), _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "Windows:" }), " Shows colored progress bar on taskbar button (blue/green/yellow/red)", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "macOS:" }), " Shows progress bar on dock icon (bouncing for indeterminate)", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "Linux:" }), " Support varies by desktop environment (Unity shows on launcher)"] }) })] })] }));
}
