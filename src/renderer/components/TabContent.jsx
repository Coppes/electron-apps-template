import React, { Suspense } from 'react';
import { useTabContext } from '../contexts/TabContext';
import { cn } from '../utils/cn';

// Lazy load pages to avoid massive initial bundle
const HomePage = React.lazy(() => import('../pages/HomePage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const BackupPage = React.lazy(() => import('../pages/BackupPage'));
const DataManagementDemoPage = React.lazy(() => import('../pages/DataManagementDemoPage'));
const ConnectivityDemoPage = React.lazy(() => import('../pages/ConnectivityDemoPage'));
const IPCDemoPage = React.lazy(() => import('../pages/IPCDemoPage'));
const SecureStorageDemoPage = React.lazy(() => import('../pages/SecureStorageDemoPage'));
const OSIntegrationDemoPage = React.lazy(() => import('../pages/OSIntegrationDemoPage')); // Note path difference in PageManager
const TestPage = React.lazy(() => import('../pages/TestPage'));
const KeyboardShortcutsPage = React.lazy(() => import('../pages/KeyboardShortcutsPage'));
const ComponentTestPage = React.lazy(() => import('../pages/ComponentTestPage'));
const SyncQueueViewer = React.lazy(() => import('./features/data-management/SyncQueueViewer'));

const TabContent = ({ group = 'primary' }) => {
  const { tabs: primaryTabs, activeTabId: primaryActiveId, secondaryTabs, secondaryActiveTabId } = useTabContext();

  const tabs = group === 'primary' ? primaryTabs : secondaryTabs;
  const activeTabId = group === 'primary' ? primaryActiveId : secondaryActiveTabId;

  // Strategy pattern: Resolve component based on tab TYPE primarily, ID as fallback
  const renderTabContent = (tab) => {
    const type = tab.type || tab.id; // Fallback to ID if type is generic 'page' or missing

    switch (type) {
      case 'component-test': return <ComponentTestPage />;
      case 'home': return <HomePage />;
      case 'settings': return <SettingsPage />;
      case 'about': return <AboutPage />;
      case 'data-management-demo': return <DataManagementDemoPage />;
      case 'connectivity-demo': return <ConnectivityDemoPage />;
      case 'ipc-demo': return <IPCDemoPage />;
      case 'secure-storage-demo': return <SecureStorageDemoPage />;
      case 'os-integration-demo': return <OSIntegrationDemoPage />;
      case 'backups': return <BackupPage />;
      case 'sync': return <SyncQueueViewer />;
      case 'test': return <TestPage />;
      case 'shortcuts': return <KeyboardShortcutsPage />;
      // Generic page type handling could go here if we have a generic 'page' component
      case 'page':
        // If it's just 'page', check ID
        if (tab.id === 'home') return <HomePage />;
        return <div className="p-4">Generic Page Content</div>;
      default:
        return <div className="p-4">Unknown tab type: {type}</div>;
    }
  };

  return (
    <div className="flex-1 overflow-hidden relative h-full">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        // Performance Optimization: Unmount inactive tabs
        // This saves memory and DOM nodes, but resets state (scroll, inputs) when switching back.
        // For a desktop-class app, we might want to keep *some* recent ones, but correct behavior
        // for "lazy loading" usually implies unmounting or never mounting.
        if (!isActive) return null;

        return (
          <div
            key={tab.id}
            className={cn(
              "absolute inset-0 w-full h-full overflow-auto bg-background transition-opacity duration-200",
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none hidden"
            )}
          // Note: Since we return null above for !isActive, the className logic for hidden/opacity-0
          // is technically redundant but kept for transition structure if we ever revert to
          // mounting but hiding.
          >
            <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
              {renderTabContent(tab)}
            </Suspense>
          </div>
        );
      })}
    </div>
  );
};

export default TabContent;
