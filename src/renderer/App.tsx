import React, { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import PopoutLayout from './components/layout/PopoutLayout';
import { useTabContext } from './contexts/TabContext';
import WhatsNewModal from './components/WhatsNewModal';

import { UpdateNotification } from './components/shared/UpdateNotification';
import ErrorBoundary from './components/shared/ErrorBoundary';

import ConnectivityStatus from './components/shared/ConnectivityStatus';
import CommandPalette from './components/CommandPalette';
import TabContent from './components/TabContent';
import Onboarding from './components/Onboarding';
import i18n from './i18n';

import { useDataMenu } from './hooks/useDataMenu';
import { useDeepLink } from './hooks/useDeepLink';


function App() {
  const { resetTabs } = useTabContext();
  const [isPopout, setIsPopout] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  const [updateStatus, setUpdateStatus] = useState(null);
  const [updateProgress, setUpdateProgress] = useState(null);

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data menu handlers
  useDataMenu();

  // Initialize deep link handler
  // Initialize deep link handler
  useDeepLink();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/popout')) {
      setIsPopout(true);
      // Robust hash parsing: #/popout/type/id or #/popout/id
      const route = hash.substring(1); // /popout/...
      const segments = route.split('/').filter(Boolean); // ['popout', 'type', 'id']

      if (segments.length >= 2) {
        const type = segments[1];
        const id = segments[2] || type;

        resetTabs([{ id, type, title: id, data: {} }]);
      }
    }
  }, [resetTabs]);


  useEffect(() => {
    // Initialize language from store
    const initLanguage = async () => {
      try {
        const result = await window.electronAPI.i18n.getLanguage();
        if (result.success && result.language) {
          // Update local i18n instance
          await i18n.changeLanguage(result.language);
        }
      } catch (error) {
        // failed to initialize
      } finally {
        setIsInitialized(true);
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

  if (!isInitialized) {
    return null;
  }

  return (
    <ErrorBoundary>
      {isPopout ? (
        <PopoutLayout>
          {/* Content rendered via TabContent inside PopoutLayout */}
        </PopoutLayout>
      ) : (
        <AppShell>
          <TabContent />
        </AppShell>
      )}

      <CommandPalette />
      <Onboarding />
      <WhatsNewModal />

      {/* Notification Toast */}
      <ConnectivityStatus />

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
