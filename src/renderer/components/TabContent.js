import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import PropTypes from 'prop-types';
const TabContent = ({ group = 'primary' }) => {
    const { tabs: primaryTabs, activeTabId: primaryActiveId, secondaryTabs, secondaryActiveTabId } = useTabContext();
    const tabs = group === 'primary' ? primaryTabs : secondaryTabs;
    const activeTabId = group === 'primary' ? primaryActiveId : secondaryActiveTabId;
    // Strategy pattern: Resolve component based on tab TYPE primarily, ID as fallback
    const renderTabContent = (tab) => {
        const type = tab.type || tab.id; // Fallback to ID if type is generic 'page' or missing
        switch (type) {
            case 'component-test': return _jsx(ComponentTestPage, {});
            case 'home': return _jsx(HomePage, {});
            case 'settings': return _jsx(SettingsPage, {});
            case 'about': return _jsx(AboutPage, {});
            case 'data-management-demo': return _jsx(DataManagementDemoPage, {});
            case 'connectivity-demo': return _jsx(ConnectivityDemoPage, {});
            case 'ipc-demo': return _jsx(IPCDemoPage, {});
            case 'secure-storage-demo': return _jsx(SecureStorageDemoPage, {});
            case 'os-integration-demo': return _jsx(OSIntegrationDemoPage, {});
            case 'backups': return _jsx(BackupPage, {});
            case 'sync': return _jsx(SyncQueueViewer, {});
            case 'test': return _jsx(TestPage, {});
            case 'shortcuts': return _jsx(KeyboardShortcutsPage, {});
            // Generic page type handling could go here if we have a generic 'page' component
            case 'page':
                // If it's just 'page', check ID
                if (tab.id === 'home')
                    return _jsx(HomePage, {});
                return _jsx("div", { className: "p-4", children: "Generic Page Content" });
            default:
                return _jsxs("div", { className: "p-4", children: ["Unknown tab type: ", type] });
        }
    };
    return (_jsx("div", { className: "flex-1 overflow-hidden relative h-full", children: tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            // Performance Optimization: Unmount inactive tabs
            // This saves memory and DOM nodes, but resets state (scroll, inputs) when switching back.
            // For a desktop-class app, we might want to keep *some* recent ones, but correct behavior
            // for "lazy loading" usually implies unmounting or never mounting.
            if (!isActive)
                return null;
            return (_jsx("div", { className: cn("absolute inset-0 w-full h-full overflow-auto bg-background transition-opacity duration-200", isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none hidden"), children: _jsx(Suspense, { fallback: _jsx("div", { className: "p-10 text-center", children: "Loading..." }), children: renderTabContent(tab) }) }, tab.id));
        }) }));
};
TabContent.propTypes = {
    group: PropTypes.string
};
export default TabContent;
