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
import OSIntegrationDemoPage from './pages/OSIntegrationDemoPage';
import TestPage from './components/pages/TestPage';
import { UpdateNotification } from './components/shared/UpdateNotification';
import ErrorBoundary from './components/shared/ErrorBoundary';
import SyncQueueViewer from './components/features/data-management/SyncQueueViewer';
import OfflineIndicator from './components/shared/OfflineIndicator';
import { StatusBarProvider } from './contexts/StatusBarContext';
import { ShortcutProvider } from './contexts/ShortcutContext';
import { CommandProvider } from './contexts/CommandContext';
import { TabProvider, useTabContext } from './contexts/TabContext';
import CommandPalette from './components/CommandPalette';
import PageManager from './components/PageManager';
import Onboarding from './components/Onboarding';

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
      <ShortcutProvider>
        <CommandProvider>
          <TabProvider>
            <StatusBarProvider>
              <AppShell>
                <PageManager />
              </AppShell>

              <CommandPalette />
              <Onboarding />
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
            </StatusBarProvider>
          </TabProvider>
        </CommandProvider>
      </ShortcutProvider>
    </ErrorBoundary>
  );
}

export default App;
