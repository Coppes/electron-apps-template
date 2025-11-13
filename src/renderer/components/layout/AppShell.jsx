import React from 'react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

const AppShell = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

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

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={currentPage === 'home' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentPage('home')}
          >
            🏠 Home
          </Button>
          <Button
            variant={currentPage === 'demo' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentPage('demo')}
          >
            🔧 Demo
          </Button>
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
