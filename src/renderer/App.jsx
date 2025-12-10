import React, { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';

import { UpdateNotification } from './components/shared/UpdateNotification';
import ErrorBoundary from './components/shared/ErrorBoundary';

import OfflineIndicator from './components/shared/OfflineIndicator';
import { StatusBarProvider } from './contexts/StatusBarContext';
import { ShortcutProvider } from './contexts/ShortcutContext';
import { CommandProvider } from './contexts/CommandContext';
import { TabProvider, useTabContext } from './contexts/TabContext';
import CommandPalette from './components/CommandPalette';
import TabContent from './components/TabContent';
import Onboarding from './components/Onboarding';

import i18n from './i18n';

import { useDataMenu } from './hooks/useDataMenu';

function App() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [updateProgress, setUpdateProgress] = useState(null);

  // Initialize data menu handlers
  useDataMenu();

  useEffect(() => {
    // Initialize language from store
    const initLanguage = async () => {
      try {
        const result = await window.electronAPI.i18n.getLanguage();
        if (result.success && result.language) {
          // Update local i18n instance
          await i18n.changeLanguage(result.language);
          console.log('Language initialized to:', result.language);
        }
      } catch (error) {
        console.error('Failed to initialize language:', error);
      }
    };
    initLanguage();
  }, []);

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
                <TabContent />
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
