import React from 'react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

const AppShell = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
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
            variant={currentPage === 'home' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentPage('home')}
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
                variant={currentPage === 'demo' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentPage('demo')}
              >
                🔧 Legacy Demo
              </Button>
              <Button
                variant={currentPage === 'data-management-demo' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentPage('data-management-demo')}
              >
                💾 Data Management
              </Button>
              <Button
                variant={currentPage === 'connectivity-demo' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentPage('connectivity-demo')}
              >
                🌐 Connectivity
              </Button>
              <Button
                variant={currentPage === 'ipc-demo' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentPage('ipc-demo')}
              >
                🔌 IPC
              </Button>
              <Button
                variant={currentPage === 'secure-storage-demo' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentPage('secure-storage-demo')}
              >
                🔐 Secure Storage
              </Button>
              <Button
                variant={currentPage === 'os-integration-demo' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentPage('os-integration-demo')}
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
                variant={currentPage === 'backups' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentPage('backups')}
              >
                💾 Backups
              </Button>
              <Button
                variant={currentPage === 'sync' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentPage('sync')}
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
                variant={currentPage === 'settings' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentPage('settings')}
              >
                ⚙️ Settings
              </Button>
              <Button
                variant={currentPage === 'about' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentPage('about')}
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
                  variant={currentPage === 'test' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setCurrentPage('test')}
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {typeof children === 'function' ? children(currentPage) : children}
      </main>
    </div>
  );
};

AppShell.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export default AppShell;
