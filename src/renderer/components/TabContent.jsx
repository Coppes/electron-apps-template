import React, { Suspense } from 'react';
import { useTabContext } from '../contexts/TabContext';
import { cn } from '../utils/cn';

// Lazy load pages to avoid massive initial bundle
const HomePage = React.lazy(() => import('./pages/HomePage'));
const DemoPage = React.lazy(() => import('./pages/DemoPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const BackupPage = React.lazy(() => import('./pages/BackupPage'));
const DataManagementDemoPage = React.lazy(() => import('./pages/DataManagementDemoPage'));
const ConnectivityDemoPage = React.lazy(() => import('./pages/ConnectivityDemoPage'));
const IPCDemoPage = React.lazy(() => import('./pages/IPCDemoPage'));
const SecureStorageDemoPage = React.lazy(() => import('./pages/SecureStorageDemoPage'));
const OSIntegrationDemoPage = React.lazy(() => import('../pages/OSIntegrationDemoPage')); // Note path difference in PageManager
const TestPage = React.lazy(() => import('./pages/TestPage'));
const KeyboardShortcutsPage = React.lazy(() => import('./pages/KeyboardShortcutsPage'));
const SyncQueueViewer = React.lazy(() => import('./features/data-management/SyncQueueViewer'));

const TabContent = () => {
  const { tabs, activeTabId } = useTabContext();

  // Strategy pattern: Resolve component based on tab TYPE primarily, ID as fallback
  const renderTabContent = (tab) => {
    const type = tab.type || tab.id; // Fallback to ID if type is generic 'page' or missing

    switch (type) {
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
        return (
          <div
            key={tab.id}
            className={cn(
              "absolute inset-0 w-full h-full overflow-auto bg-background transition-opacity duration-200",
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none hidden"
            )}
          // 'hidden' class is added when inactive to prevent interaction and remove from accessibility tree,
          // but we might want to keep it in DOM if we want state preservation.
          // If 'hidden' (display: none) is used, scroll position is usually lost unless we use visibility: hidden.
          // Using display: none is safer for performance but loses scroll.
          // Let's use display: none for now as per Shadcn tabs usually do, OR keep it mounted.
          // Code implies standard "Tabs" behavior.
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
