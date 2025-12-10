import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn.js';
import Button from '../ui/Button';
import StatusBar from '../StatusBar';
import TabBar from '../TabBar';
import { useTab } from '../../hooks/useTab';
import { useNavigationCommands } from '../../hooks/useNavigationCommands';
import { useTabCommands } from '../../hooks/useTabCommands';
import { useLanguageStatus } from '../../hooks/useLanguageStatus';
import { isDevelopment } from '../../utils/is-dev';
import { useStatusBar } from '../../hooks/useStatusBar';
import {
  House,
  Wrench,
  FloppyDisk,
  Globe,
  Plug,
  Lock,
  Laptop,
  ArrowsClockwise,
  Gear,
  Info,
  Flask
} from '@phosphor-icons/react';

const AppShell = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const { openTab, activeTabId, tabs, closeTab } = useTab();
  const { t } = useTranslation('common');

  // Register Global Navigation Commands
  useNavigationCommands();
  useTabCommands();
  useLanguageStatus();

  // File Watcher Notification
  const { update: updateNotification } = useStatusBar({
    id: 'file-watcher-notification',
    position: 'right',
    priority: 1000, // High priority to be visible
    content: null,
  });

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Helper handling tab opening
  const nav = (id, title, typeOverride) => {
    // If we want singleton behavior, use fixed ID.
    // If ID matches, it switches.
    const type = typeOverride || id;
    openTab({ id, title, type });
  };

  // Listen for menu actions (IPC)
  useEffect(() => {
    let cleanupMenuListener;
    if (window.electronAPI?.events?.onMenuAction) {
      cleanupMenuListener = window.electronAPI.events.onMenuAction((action) => {
        if (action === 'new-tab') {
          openTab({ id: `tab-${Date.now()}`, title: t('nav.new_tab', 'New Tab'), type: 'page' });
        }
        if (action === 'close-tab') {
          if (tabs.length > 1) {
            closeTab(activeTabId);
          } else {
            window.electronAPI.window.close();
          }
        }
      });
    }
    return () => {
      if (cleanupMenuListener) cleanupMenuListener();
    };
  }, [openTab, t, tabs, activeTabId, closeTab]);

  // Listen for file changes
  useEffect(() => {
    let cleanupFileListener;
    if (window.electronAPI?.file?.onFileChanged) {
      cleanupFileListener = window.electronAPI.file.onFileChanged((data) => {
        // data can be { filePath, event } or just filePath depending on implementation
        // Assuming data object or string
        const path = typeof data === 'string' ? data : data.filePath;

        updateNotification({
          content: (
            <div className="flex items-center gap-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded animate-pulse">
              <span className="text-xs font-medium">⚠️ File Changed: {path.split(/[/\\]/).pop()}</span>
            </div>
          )
        });

        // Clear after 5 seconds
        const timer = setTimeout(() => {
          updateNotification({ content: null });
        }, 5000);

        return () => clearTimeout(timer);
      });
    }
    return () => {
      if (cleanupFileListener) cleanupFileListener();
    };
  }, [updateNotification]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        <aside
          style={{ width: `${sidebarWidth}px` }}
          className="flex flex-col border-r border-border bg-card"
        >
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">{t('nav.title')}</h2>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Button
              variant={activeTabId === 'home' ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => nav('home', t('nav.home'))}
            >
              <House className="w-4 h-4" />
              {t('nav.home')}
            </Button>

            {/* Demos Section */}
            <div className="pt-4 pb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase px-3 pb-2">
                {t('nav.sections.demos')}
              </div>
              <div className="space-y-1">
                <Button
                  variant={activeTabId === 'demo' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => nav('demo', t('nav.items.legacy_demo'))}
                >
                  <Wrench className="w-4 h-4" />
                  {t('nav.items.legacy_demo')}
                </Button>
                <Button
                  variant={activeTabId === 'data-management-demo' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => nav('data-management-demo', t('nav.items.data_mgmt'))}
                >
                  <FloppyDisk className="w-4 h-4" />
                  {t('nav.items.data_mgmt')}
                </Button>
                <Button
                  variant={activeTabId === 'connectivity-demo' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => nav('connectivity-demo', t('nav.items.connectivity'))}
                >
                  <Globe className="w-4 h-4" />
                  {t('nav.items.connectivity')}
                </Button>
                <Button
                  variant={activeTabId === 'ipc-demo' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => nav('ipc-demo', t('nav.items.ipc'))}
                >
                  <Plug className="w-4 h-4" />
                  {t('nav.items.ipc')}
                </Button>
                <Button
                  variant={activeTabId === 'secure-storage-demo' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => nav('secure-storage-demo', t('nav.items.secure_storage'))}
                >
                  <Lock className="w-4 h-4" />
                  {t('nav.items.secure_storage')}
                </Button>
                <Button
                  variant={activeTabId === 'os-integration-demo' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => nav('os-integration-demo', t('nav.items.os_integration'))}
                >
                  <Laptop className="w-4 h-4" />
                  {t('nav.items.os_integration')}
                </Button>
              </div>
            </div>

            {/* Data Section */}
            <div className="pt-2 pb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase px-3 pb-2">
                {t('nav.sections.data')}
              </div>
              <div className="space-y-1">
                <Button
                  variant={activeTabId === 'backups' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => nav('backups', t('nav.items.backups'))}
                >
                  <FloppyDisk className="w-4 h-4" />
                  {t('nav.items.backups')}
                </Button>
                <Button
                  variant={activeTabId === 'sync' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => nav('sync', t('nav.items.sync_queue'))}
                >
                  <ArrowsClockwise className="w-4 h-4" />
                  {t('nav.items.sync_queue')}
                </Button>
              </div>
            </div>

            {/* Settings Section */}
            <div className="pt-2 pb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase px-3 pb-2">
                {t('nav.sections.settings')}
              </div>
              <div className="space-y-1">
                <Button
                  variant={activeTabId === 'settings' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => nav('settings', t('nav.items.settings'))}
                >
                  <Gear className="w-4 h-4" />
                  {t('nav.items.settings')}
                </Button>
                <Button
                  variant={activeTabId === 'about' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => nav('about', t('nav.items.about'))}
                >
                  <Info className="w-4 h-4" />
                  {t('nav.items.about')}
                </Button>
              </div>
            </div>

            {/* Development Section */}
            {isDevelopment && (
              <div className="pt-2 pb-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase px-3 pb-2">
                  {t('nav.sections.development')}
                </div>
                <div className="space-y-1">
                  <Button
                    variant={activeTabId === 'test' ? 'default' : 'ghost'}
                    className="w-full justify-start gap-2"
                    onClick={() => nav('test', t('nav.items.test_playground'))}
                  >
                    <Flask className="w-4 h-4" />
                    {t('nav.items.test_playground')}
                  </Button>
                </div>
              </div>
            )}
          </nav>
        </aside>

        {/* Resize Handle */}
        <div
          className={cn(
            'w-1 cursor-col-resize hover:bg-primary/20 transition-colors',
            isResizing && 'bg-primary/40'
          )}
          onMouseDown={handleMouseDown}
        />

        {/* Main Content Area with Tabs */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <TabBar />
          <main className="flex-1 relative overflow-hidden">
            {children}
          </main>
        </div>
      </div>
      <StatusBar />
    </div>
  );
};

AppShell.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppShell;
