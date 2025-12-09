import React, { useContext } from 'react';
import { StatusBarContext } from '../contexts/StatusBarContext';
import { cn } from '../utils/cn.js';

const StatusBar = () => {
  const { items } = useContext(StatusBarContext);

  const leftItems = items
    .filter((item) => item.position === 'left')
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const centerItems = items
    .filter((item) => item.position === 'center')
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const rightItems = items
    .filter((item) => !item.position || item.position === 'right')
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return (
    <div className="h-6 bg-primary text-primary-foreground flex items-center justify-between px-2 text-xs select-none border-t border-border/20">
      <div className="flex items-center gap-4 min-w-[30%]">
        {leftItems.map((item) => (
          <div key={item.id} className={cn("flex items-center", item.className)}>
            {item.content}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 justify-center min-w-[30%]">
        {centerItems.map((item) => (
          <div key={item.id} className={cn("flex items-center", item.className)}>
            {item.content}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 justify-end min-w-[30%]">
        {rightItems.map((item) => (
          <div key={item.id} className={cn("flex items-center", item.className)}>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBar;
