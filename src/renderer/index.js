import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { CommandProvider } from './contexts/CommandContext';
import { TabProvider } from './contexts/TabContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { StatusBarProvider } from './contexts/StatusBarContext';
import { ShortcutProvider } from './contexts/ShortcutContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { PluginProvider } from './contexts/PluginContext';
import { TourProvider } from './contexts/TourContext';
import App from './App';
import './index.css';
// Ensure React DevTools are available in development
if (process.env.NODE_ENV === 'development') {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(_jsx(React.StrictMode, { children: _jsx(SettingsProvider, { children: _jsx(StatusBarProvider, { children: _jsx(ShortcutProvider, { children: _jsx(CommandProvider, { children: _jsx(HistoryProvider, { children: _jsxs(PluginProvider, { children: [_jsxs(TourProvider, { children: [" ", _jsx(TabProvider, { children: _jsx(App, {}) })] }), " "] }) }) }) }) }) }) }));
