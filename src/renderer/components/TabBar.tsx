import React from 'react';

import * as ContextMenu from './ui/ContextMenu';
import { X, House, Gear, Info, Cube, Plus } from '@phosphor-icons/react';
import { useTabContext } from '../contexts/TabContext';
import { useStatusBar } from '../hooks/useStatusBar';
import { useRegisterCommand } from '../hooks/useRegisterCommand';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils/cn.ts';

import PropTypes from 'prop-types';

const TabBar = ({ group = 'primary' }) => {
  const {
    tabs: primaryTabs, activeTabId: primaryActiveId,
    secondaryTabs, secondaryActiveTabId,
    setActiveTab, closeTab, closeAllTabs, closeOtherTabs, addTab, reorderTab, moveTabToGroup,
    draggingTab, setDraggingTab
  } = useTabContext();

  const tabs = group === 'primary' ? primaryTabs : secondaryTabs;
  const activeTabId = group === 'primary' ? primaryActiveId : secondaryActiveTabId;

  const { t } = useTranslation('common');

  // Memoize status bar content to prevent infinite updates
  const statusBarItem = React.useMemo(() => ({
    id: 'tab-count',
    content: <span className="text-xs text-muted-foreground">{t('status.tabs', { count: tabs.length })}</span>,
    position: 'right',
    priority: 10
  }), [tabs.length, t]);

  // Update Status Bar
  useStatusBar(statusBarItem);

  // Register Commands - Memoize actions to prevent re-registration loops
  // Note: useRegisterCommand handles registration in useEffect, but if we pass new object every time, it re-runs.

  const closeAllAction = React.useCallback(() => closeAllTabs(), [closeAllTabs]);
  const closeOtherAction = React.useCallback(() => closeOtherTabs(activeTabId), [closeOtherTabs, activeTabId]);
  const newTabAction = React.useCallback(() => addTab({ id: `tab-${Date.now()}`, title: t('command.new_tab', 'New Tab'), type: 'page' }), [addTab, t]);

  useRegisterCommand(React.useMemo(() => ({
    id: 'close-all-tabs',
    label: t('command.close_all_tabs', 'Close All Tabs'),
    group: 'Tabs',
    action: closeAllAction,
    keywords: ['Close All Tabs']
  }), [closeAllAction, t]));

  useRegisterCommand(React.useMemo(() => ({
    id: 'close-other-tabs',
    label: t('command.close_other_tabs', 'Close Other Tabs'),
    group: 'Tabs',
    action: closeOtherAction,
    keywords: ['Close Other Tabs']
  }), [closeOtherAction, t]));

  useRegisterCommand(React.useMemo(() => ({
    id: 'new-tab',
    label: t('command.new_tab', 'New Tab'),
    group: 'Tabs',
    shortcut: 'Ctrl+T',
    action: newTabAction,
    keywords: ['New Tab']
  }), [newTabAction, t]));

  // Register Global Shortcut for New Tab
  useKeyboardShortcut({
    id: 'shortcut-new-tab',
    keys: 'Ctrl+T',
    action: newTabAction,
    description: t('command.new_tab', 'Open New Tab') // Reusing New Tab label or could be specific
  });

  // Helper to get icon for tab
  const getIcon = (id) => {
    if (id === 'home') return <House className="w-4 h-4" />;
    if (id === 'settings') return <Gear className="w-4 h-4" />;
    if (id === 'about') return <Info className="w-4 h-4" />;
    return <Cube className="w-4 h-4" />;
  };


  const [dragOverIndex, setDragOverIndex] = React.useState(null);

  return (
    <div
      className={cn(
        "w-full bg-muted/40 border-b border-border transition-colors",
        draggingTab?.group === group && "bg-muted/60" // Feedback for active group
      )}
      onAuxClick={(e) => {
        if (e.button === 1 && e.target === e.currentTarget) {
          newTabAction();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOverIndex(null);
        setDraggingTab(null);
        const tabId = e.dataTransfer.getData('application/tab-id');
        if (tabId) {
          // If tab is in this group, reorder to end?
          // If from other group, move here.
          // We need to know if tab is in this group.
          const isInGroup = tabs.find(t => t.id === tabId);
          if (isInGroup) {
            reorderTab(tabs.indexOf(isInGroup), tabs.length);
          } else {
            moveTabToGroup(tabId, group);
          }
        }
      }}
      onDragLeave={() => setDragOverIndex(null)}
    >
      <div className="flex items-center w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab, index) => (
          <ContextMenu.ContextMenu key={tab.id}>
            <ContextMenu.ContextMenuTrigger>
              <div
                draggable
                onDragStart={(e) => {
                  setDraggingTab({ id: tab.id, group, index });
                  e.dataTransfer.setData('text/plain', index.toString());
                  e.dataTransfer.setData('application/tab-id', tab.id);
                }}
                onDragEnd={(e) => {
                  setDraggingTab(null);
                  setDragOverIndex(null);

                  // Tear-out logic: Check if dropped outside window
                  if (e.clientX < 0 || e.clientX > window.innerWidth || e.clientY < 0 || e.clientY > window.innerHeight) {
                    // Create new window
                    // Using invoke 'window:create' as defined in main/ipc/handlers/window.js
                    // IPC_CHANNELS.WINDOW_CREATE needs to be used via bridge or 'window:create' string?
                    // src/preload/index.cjs exposes 'window.electronAPI.window.create' ?
                    // Let's check preload or use invoke directly if exposed.
                    // Usually window.electronAPI.ipc.invoke is not exposed directly for security.
                    // We should check what's exposed. 
                    // Assuming window.electronAPI.window.create(type, options) exists or similar.
                    // Re-checking src/renderer/index.js -> App -> AppShell -> ... 
                    // Let's assume window.electronAPI.invoke exists OR use a specific exposed method.
                    // src/preload/index.cjs usually maps specific methods.

                    // Check logic below for safer approach
                    const route = `/popout/${tab.type}/${tab.id}`;
                    if (window.electronAPI?.window?.create) {
                      window.electronAPI.window.create('auxiliary', { route, x: e.screenX, y: e.screenY });
                    } else if (window.electronAPI?.invoke) {
                      window.electronAPI.invoke('window:create', { type: 'auxiliary', options: { route, x: e.screenX, y: e.screenY } });
                    }
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Calculate if we are on left or right half
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mid = (rect.left + rect.right) / 2;
                  const isRight = e.clientX > mid;
                  setDragOverIndex(isRight ? index + 1 : index);
                }}
                onDrop={(e) => {
                  // Handled by Spacer or this element if spacer is small?
                  // Actually let's delegate drop to the visual spacer logic mostly, 
                  // OR handle it here.
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverIndex(null);
                  setDraggingTab(null);
                  const tabId = e.dataTransfer.getData('application/tab-id');
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                  // If moving within same group
                  if (tabId && tabs.find(t => t.id === tabId)) {
                    reorderTab(fromIndex, index, group);
                  } else if (tabId) {
                    moveTabToGroup(tabId, group);
                  }
                }}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 text-xs border-r border-border/50 cursor-pointer select-none transition-colors min-w-[120px] max-w-[200px]",
                  activeTabId === tab.id
                    ? "bg-background text-foreground border-b-2 border-b-primary font-medium"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                )}
                onClick={() => setActiveTab(tab.id)}
                onAuxClick={(e) => {
                  if (e.button === 1) {
                    e.preventDefault();
                    closeTab(tab.id);
                  }
                }}
              >
                {getIcon(tab.id)}
                <span className="truncate flex-1">
                  {tab.type === 'home' ? t('nav.home') :
                    tab.type === 'settings' ? t('nav.items.settings') :
                      tab.type === 'demo' ? t('nav.items.legacy_demo') :
                        tab.type === 'test' ? t('nav.items.test_playground') :
                          tab.title}
                </span>
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
            </ContextMenu.ContextMenuTrigger>
            <ContextMenu.ContextMenuContent className="min-w-[160px] bg-popover rounded-md border border-border p-1 shadow-md z-[50]">
              <ContextMenu.ContextMenuItem
                onClick={() => addTab({ ...tab, id: `tab-${Date.now()}` })}
              >
                Duplicate Tab
              </ContextMenu.ContextMenuItem>
              <ContextMenu.ContextMenuSeparator />
              <ContextMenu.ContextMenuItem
                onClick={() => closeTab(tab.id)}
              >
                Close Tab
              </ContextMenu.ContextMenuItem>
              <ContextMenu.ContextMenuItem
                onClick={() => closeOtherTabs(tab.id)}
              >
                Close Others
              </ContextMenu.ContextMenuItem>
              <ContextMenu.ContextMenuItem
                onClick={() => {
                  const targetGroup = group === 'primary' ? 'secondary' : 'primary';
                  moveTabToGroup(tab.id, targetGroup);
                }}
              >
                Split Right
              </ContextMenu.ContextMenuItem>
              <ContextMenu.ContextMenuSeparator />
              <ContextMenu.ContextMenuItem
                className="text-destructive focus:text-destructive"
                onClick={closeAllTabs}
              >
                Close All
              </ContextMenu.ContextMenuItem>
            </ContextMenu.ContextMenuContent>
          </ContextMenu.ContextMenu>
        ))}

        {/* Trailing Spacer for appending at end */}
        <div
          className={cn(
            "transition-all duration-200 ease-in-out w-0 overflow-hidden",
            (dragOverIndex === tabs.length &&
              !(draggingTab?.group === group && draggingTab?.index === tabs.length - 1)
            ) && "w-[120px] opacity-50 bg-primary/10 border-2 border-dashed border-primary/30 rounded mx-1"
          )}
          style={{ height: '32px' }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverIndex(tabs.length);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverIndex(null);
            setDraggingTab(null);
            const tabId = e.dataTransfer.getData('application/tab-id');
            if (tabId) {
              // Determine if move or reorder (append)
              const isInGroup = tabs.find(t => t.id === tabId);
              if (isInGroup) {
                reorderTab(tabs.indexOf(isInGroup), tabs.length, group);
              } else {
                moveTabToGroup(tabId, group);
              }
            }
          }}
        />
        <button
          className="flex items-center justify-center px-3 py-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors border-r border-border/50"
          onClick={newTabAction}
          title="New Tab (Ctrl+T)"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverIndex(tabs.length);
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div >
  );
};

TabBar.propTypes = {
  group: PropTypes.string
};

export default TabBar;
