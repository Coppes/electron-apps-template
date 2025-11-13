import React, { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import HomePage from './components/pages/HomePage';
import DemoPage from './components/pages/DemoPage';
import SettingsPage from './components/pages/SettingsPage';
import AboutPage from './components/pages/AboutPage';
import BackupPage from './components/pages/BackupPage';
import DataManagementDemoPage from './components/pages/DataManagementDemoPage';
import ConnectivityDemoPage from './components/pages/ConnectivityDemoPage';
import IPCDemoPage from './components/pages/IPCDemoPage';
import SecureStorageDemoPage from './components/pages/SecureStorageDemoPage';
import TestPage from './components/pages/TestPage';
import { UpdateNotification } from './components/shared/UpdateNotification';
import ErrorBoundary from './components/shared/ErrorBoundary';
import SyncQueueViewer from './components/features/data-management/SyncQueueViewer';
import OfflineIndicator from './components/shared/OfflineIndicator';

function App() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [updateProgress, setUpdateProgress] = useState(null);

  useEffect(() => {
    // Listen for update available
    const cleanupAvailable = window.electronAPI.events.onUpdateAvailable((info) => {
      setUpdateInfo(info);
      setUpdateStatus('available');
    });

    // Listen for update downloaded
    const cleanupDownloaded = window.electronAPI.events.onUpdateDownloaded((info) => {
      setUpdateInfo(info);
      setUpdateStatus('ready');
    });

    // Listen for update progress
    const cleanupProgress = window.electronAPI.events.onUpdateProgress((progress) => {
      setUpdateProgress(progress);
      setUpdateStatus('downloading');
    });

    // Listen for update errors
    const cleanupError = window.electronAPI.events.onUpdateError((error) => {
      window.electronAPI.log.error('Update error', { error });
      setUpdateStatus(null);
    });

    return () => {
      cleanupAvailable();
      cleanupDownloaded();
      cleanupProgress();
      cleanupError();
    };
  }, []);

  const handleInstall = async () => {
    if (updateStatus === 'available') {
      // Start download (auto-download should handle this, but we can trigger it)
      setUpdateStatus('downloading');
    } else if (updateStatus === 'ready') {
      // Install and restart
      try {
        await window.electronAPI.app.installUpdate();
      } catch (error) {
        window.electronAPI.log.error('Failed to install update', { error: error.message });
      }
    }
  };

  const handleDismiss = () => {
    setUpdateStatus(null);
  };

  return (
    <ErrorBoundary>
      <AppShell>
        {(currentPage) => {
          switch (currentPage) {
            case 'home':
              return <HomePage />;
            case 'demo':
              return <DemoPage />;
            case 'data-management-demo':
              return <DataManagementDemoPage />;
            case 'connectivity-demo':
              return <ConnectivityDemoPage />;
            case 'ipc-demo':
              return <IPCDemoPage />;
            case 'secure-storage-demo':
              return <SecureStorageDemoPage />;
            case 'backups':
              return <BackupPage />;
            case 'sync':
              return <SyncQueueViewer />;
            case 'test':
              return <TestPage />;
            case 'settings':
              return <SettingsPage />;
            case 'about':
              return <AboutPage />;
            default:
              return <HomePage />;
          }
        }}
      </AppShell>
      
      <OfflineIndicator position="top-right" />
      
      {updateStatus && (
        <UpdateNotification
          updateInfo={updateInfo}
          status={updateStatus}
          progress={updateProgress}
          onInstall={handleInstall}
          onDismiss={handleDismiss}
        />
      )}
    </ErrorBoundary>
  );
}

export default App;
