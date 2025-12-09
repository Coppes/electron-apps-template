import React from 'react';
import { useTabContext } from '../contexts/TabContext';
import HomePage from './pages/HomePage';
import DemoPage from './pages/DemoPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import BackupPage from './pages/BackupPage';
import DataManagementDemoPage from './pages/DataManagementDemoPage';
import ConnectivityDemoPage from './pages/ConnectivityDemoPage';
import IPCDemoPage from './pages/IPCDemoPage';
import SecureStorageDemoPage from './pages/SecureStorageDemoPage';
import OSIntegrationDemoPage from '../pages/OSIntegrationDemoPage';
import TestPage from './pages/TestPage';
import KeyboardShortcutsPage from './pages/KeyboardShortcutsPage';
import SyncQueueViewer from './features/data-management/SyncQueueViewer';

const PageManager = () => {
  const { activeTabId } = useTabContext();

  switch (activeTabId) {
    case 'home': return <HomePage />;
    case 'settings': return <SettingsPage />;
    case 'about': return <AboutPage />;
    case 'demo': return <DemoPage />;
    case 'data-management-demo': return <DataManagementDemoPage />;
    case 'connectivity-demo': return <ConnectivityDemoPage />;
    case 'ipc-demo': return <IPCDemoPage />;
    case 'secure-storage-demo': return <SecureStorageDemoPage />;
    case 'os-integration-demo': return <OSIntegrationDemoPage />;
    case 'backups': return <BackupPage />;
    case 'sync': return <SyncQueueViewer />;
    case 'test': return <TestPage />;
    case 'shortcuts': return <KeyboardShortcutsPage />;
    default: return <HomePage />;
  }
};

export default PageManager;
