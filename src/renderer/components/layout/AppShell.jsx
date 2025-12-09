import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn.js';
import Button from '../ui/Button';
import StatusBar from '../StatusBar';
import TabBar from '../TabBar';
import { useTab } from '../../hooks/useTab';
import { isDevelopment } from '../../utils/is-dev';

const AppShell = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const { openTab, activeTabId } = useTab();

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
  const nav = (id, title) => {
    openTab({ id, title, type: 'page' });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        {/* Sidebar */}
        <aside
          style={{ width: `${sidebarWidth}px` }}
          className="flex flex-col border-r border-border bg-card"
        >
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Electron App</h2>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Button
              variant={activeTabId === 'home' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => nav('home', 'Home')}
            >
              🏠 Home
            </Button>

            {/* Demos Section */}
            <div className="pt-4 pb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase px-3 pb-2">
                Demos
              </div>
              <div className="space-y-1">
                <Button
                  variant={activeTabId === 'demo' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => nav('demo', 'Legacy Demo')}
                >
                  🔧 Legacy Demo
                </Button>
                <Button
                  variant={activeTabId === 'data-management-demo' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => nav('data-management-demo', 'Data Mgmt')}
                >
                  💾 Data Management
                </Button>
                <Button
                  variant={activeTabId === 'connectivity-demo' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => nav('connectivity-demo', 'Connectivity')}
                >
                  🌐 Connectivity
                </Button>
                <Button
                  variant={activeTabId === 'ipc-demo' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => nav('ipc-demo', 'IPC')}
                >
                  🔌 IPC
                </Button>
                <Button
                  variant={activeTabId === 'secure-storage-demo' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => nav('secure-storage-demo', 'Secure Storage')}
                >
                  🔐 Secure Storage
                </Button>
                <Button
                  variant={activeTabId === 'os-integration-demo' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => nav('os-integration-demo', 'OS Integration')}
                >
                  💻 OS Integration
                </Button>
              </div>
            </div>

            {/* Data Section */}
            <div className="pt-2 pb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase px-3 pb-2">
                Data
              </div>
              <div className="space-y-1">
                <Button
                  variant={activeTabId === 'backups' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => nav('backups', 'Backups')}
                >
                  💾 Backups
                </Button>
                <Button
                  variant={activeTabId === 'sync' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => nav('sync', 'Sync Queue')}
                >
                  🔄 Sync Queue
                </Button>
              </div>
            </div>

            {/* Settings Section */}
            <div className="pt-2 pb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase px-3 pb-2">
                Settings
              </div>
              <div className="space-y-1">
                <Button
                  variant={activeTabId === 'settings' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => nav('settings', 'Settings')}
                >
                  ⚙️ Settings
                </Button>
                <Button
                  variant={activeTabId === 'about' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => nav('about', 'About')}
                >
                  ℹ️ About
                </Button>
              </div>
            </div>

            {/* Development Section */}
            {isDevelopment && (
              <div className="pt-2 pb-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase px-3 pb-2">
                  Development
                </div>
                <div className="space-y-1">
                  <Button
                    variant={activeTabId === 'test' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => nav('test', 'Test Playground')}
                  >
                    🧪 Test Playground
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
          <main className="flex-1 overflow-auto">
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
