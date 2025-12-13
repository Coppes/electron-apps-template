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
import { TitleBar } from './TitleBar';
import TabContent from '../TabContent';

const AppShell = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [resizingTarget, setResizingTarget] = useState(null); // 'sidebar' | 'split' | null
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [dragTarget, setDragTarget] = useState(null); // 'primary' | 'secondary' | null
  const { openTab, activeTabId, tabs, closeTab, isSplit, moveTabToGroup } = useTab();
  const { t } = useTranslation('common');

  // Register Global Navigation Commands
  useNavigationCommands();
  useTabCommands();
  useLanguageStatus();

  // File Watcher Notification
  const { update: updateNotification } = useStatusBar({
    id: 'file-watcher-notification',
    position: 'right',
    priority: 1000,
    content: null,
  });

  const handleMouseDown = (e) => {
    e.preventDefault();
    setResizingTarget('sidebar');
  };

  const handleMouseMove = (e) => {
    if (resizingTarget === 'sidebar') {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    } else if (resizingTarget === 'split') {
      const contentWidth = window.innerWidth - sidebarWidth;
      const relativeX = e.clientX - sidebarWidth;
      const newRatio = Math.min(Math.max(relativeX / contentWidth, 0.2), 0.8);
      setSplitRatio(newRatio);
    }
  };

  const handleMouseUp = () => {
    setResizingTarget(null);
  };

  useEffect(() => {
    if (resizingTarget) {
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
  }, [resizingTarget, sidebarWidth]); // Updated dependencies

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
      <TitleBar className="relative bg-background border-b border-border" />
      <div className="flex flex-1 overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        <aside
          style={{ width: `${sidebarWidth}px` }}
          className="flex flex-col border-r border-border bg-card"
        >
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">{t('nav.title')}</h2>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto" data-tour="sidebar-nav">
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
                  data-tour="settings-link"
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
                  <Button
                    variant={activeTabId === 'component-test' ? 'default' : 'ghost'}
                    className="w-full justify-start gap-2"
                    onClick={() => nav('component-test', 'UI Playground')}
                  >
                    <Flask className="w-4 h-4" />
                    UI Playground
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
            resizingTarget === 'sidebar' && 'bg-primary/40'
          )}
          onMouseDown={handleMouseDown}
        />

        {/* Main Content Area with Tabs */}
        {!isSplit ? (
          <div className="flex flex-col flex-1 overflow-hidden min-w-0">
            <TabBar group="primary" />
            <main
              className={cn(
                "flex-1 relative overflow-hidden transition-all",
                dragTarget === 'secondary' && "bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-inset ring-blue-500"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragTarget('secondary'); // Suggests moving to secondary (which will split)
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget)) return;
                setDragTarget(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragTarget(null);
                const tabId = e.dataTransfer.getData('application/tab-id');
                if (tabId) {
                  moveTabToGroup(tabId, 'secondary');
                }
              }}
            >
              <TabContent group="primary" />
              {dragTarget === 'secondary' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-background/50 backdrop-blur-[1px]">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                    Open in Split View
                  </span>
                </div>
              )}
            </main>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden min-w-0 relative">
            {/* Primary Pane */}
            <div
              className="flex flex-col overflow-hidden border-r border-border min-w-0"
              style={{ flex: splitRatio }}
            >
              <TabBar group="primary" />
              <main
                className={cn(
                  "flex-1 relative overflow-hidden transition-all",
                  dragTarget === 'primary' && "bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-inset ring-blue-500"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragTarget('primary');
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget)) return;
                  setDragTarget(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragTarget(null);
                  const tabId = e.dataTransfer.getData('application/tab-id');
                  if (tabId) {
                    moveTabToGroup(tabId, 'primary');
                  }
                }}
              >
                <TabContent group="primary" />
              </main>
            </div>

            {/* Split Resize Handle */}
            <div
              className={cn(
                "w-1 cursor-col-resize hover:bg-primary/20 transition-colors z-10",
                resizingTarget === 'split' && "bg-primary/40"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                setResizingTarget('split');
              }}
            />

            {/* Secondary Pane */}
            <div
              className="flex flex-col overflow-hidden min-w-0"
              style={{ flex: 1 - splitRatio }}
            >
              <TabBar group="secondary" />
              <main
                className={cn(
                  "flex-1 relative overflow-hidden transition-all",
                  dragTarget === 'secondary' && "bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-inset ring-blue-500"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragTarget('secondary');
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget)) return;
                  setDragTarget(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragTarget(null);
                  const tabId = e.dataTransfer.getData('application/tab-id');
                  if (tabId) {
                    moveTabToGroup(tabId, 'secondary');
                  }
                }}
              >
                <TabContent group="secondary" />
              </main>
            </div>
          </div>
        )}
      </div>
      <StatusBar />
    </div>
  );
};

AppShell.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppShell;
