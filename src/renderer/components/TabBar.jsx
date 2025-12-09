import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { X, Home, Settings, Info, Box } from 'lucide-react';
import { useTabContext } from '../contexts/TabContext';
import { cn } from '../utils/cn.js';

const TabBar = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabContext();

  // Helper to get icon for tab
  const getIcon = (id) => {
    switch (id) {
      case 'home': return <Home className="w-3 h-3" />;
      case 'settings': return <Settings className="w-3 h-3" />;
      case 'about': return <Info className="w-3 h-3" />;
      default: return <Box className="w-3 h-3" />;
    }
  };

  return (
    <div className="w-full bg-muted/40 border-b border-border">
      <div className="flex items-center w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 text-xs border-r border-border/50 cursor-pointer select-none transition-colors min-w-[120px] max-w-[200px]",
              activeTabId === tab.id
                ? "bg-background text-foreground border-b-2 border-b-primary font-medium"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {getIcon(tab.id)}
            <span className="truncate flex-1">{tab.title}</span>
            <button
              className={cn(
                "opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded p-0.5 transition-all",
                activeTabId === tab.id && "opacity-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabBar;
