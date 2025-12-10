import React from 'react';
import { useStatusBar } from '../../contexts/StatusBarContext';
import { Circle } from '@phosphor-icons/react';
import { useDataMenu } from '../../hooks/useDataMenu';

const StatusBar = () => {
  const { status, message } = useStatusBar();
  // Using custom hook or navigator for connectivity
  // Since we don't have a global ConnectivityContext yet (only in demo), 
  // we'll rely on browser API for simplified status or create a small local hook.
  // Ideally, useDataMenu hook or similar might expose it or we check navigator.onLine.

  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also listen to electron event if available
    const cleanup = window.electronAPI?.data?.onConnectivityChanged?.((status) => {
      // IPC event payload might be an object or boolean depending on sender. 
      // ConnectivityManager sends { online: boolean, timestamp: ... } as payload in notifyConnectivityChange via webContents.send
      // But acts as a boolean in the callback? Let's check preload. 
      // Preload: const listener = (event, data) => callback(data);
      // Main: window.webContents.send(IPC_CHANNELS.CONNECTIVITY_STATUS, { online: isOnline, ... });
      // So data is an object { online: true/false }. 
      // But preload callback usage in StatusBar: setIsOnline(status). 
      // If status is an object { online: true }, then setIsOnline({online:true}) -> inside JSX checks boolean scope?
      // JSX: {isOnline ? 'Online' : 'Offline'} -> Object is truthy!
      // I need to fix the listener to handle the object payload properly.

      const newStatus = typeof status === 'object' ? status.online : status;
      setIsOnline(newStatus);
    });

    // Fetch initial status from Electron to be accurate
    if (window.electronAPI?.data?.getConnectivityStatus) {
      window.electronAPI.data.getConnectivityStatus().then(result => {
        if (result && typeof result.online === 'boolean') {
          setIsOnline(result.online);
        }
      }).catch(console.error);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanup && cleanup();
    };
  }, []);

  return (
    <footer className="h-6 bg-primary text-primary-foreground text-xs flex items-center justify-between px-3 select-none">
      <div className="flex items-center gap-2">
        <span className={`flex items-center gap-1 ${status === 'error' ? 'text-red-300' : ''}`}>
          {status === 'loading' && (
            <Circle className="w-2 h-2 animate-pulse text-yellow-300" weight="fill" />
          )}
          {status === 'success' && (
            <Circle className="w-2 h-2 text-green-300" weight="fill" />
          )}
          {status === 'error' && (
            <Circle className="w-2 h-2 text-red-300" weight="fill" />
          )}
          {message || 'Ready'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5" title={isOnline ? "Online" : "Offline"}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="opacity-80">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <span className="opacity-50">v{window.electronAPI?.app ? '1.0.0' : 'Dev'}</span>
      </div>
    </footer>
  );
};

export default StatusBar;
