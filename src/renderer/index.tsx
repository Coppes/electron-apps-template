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
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <StatusBarProvider>
        <ShortcutProvider>
          <CommandProvider>
            <HistoryProvider>
              <PluginProvider>
                <TourProvider> {/* Added TourProvider */}
                  <TabProvider>
                    <App />
                  </TabProvider>
                </TourProvider> {/* Closed TourProvider */}
              </PluginProvider>
            </HistoryProvider>
          </CommandProvider>
        </ShortcutProvider>
      </StatusBarProvider>
    </SettingsProvider>
  </React.StrictMode>
);
