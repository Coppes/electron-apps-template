import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn.ts';
import Button from '../ui/Button';
import StatusBar from '../StatusBar';
import TabBar from '../TabBar';
import { useTab } from '../../hooks/useTab';
import { useNavigationCommands } from '../../hooks/useNavigationCommands';
import { useTabCommands } from '../../hooks/useTabCommands';
import { useLanguageStatus } from '../../hooks/useLanguageStatus';
import { isDevelopment } from '../../utils/is-dev';
import { useStatusBar } from '../../hooks/useStatusBar';
import { House, FloppyDisk, Globe, Plug, Lock, Laptop, ArrowsClockwise, Gear, Info, Flask } from '@phosphor-icons/react';
import { TitleBar } from './TitleBar';
import TabContent from '../TabContent';
import * as ContextMenu from '../ui/ContextMenu';
import { useTabContext } from '../../contexts/TabContext';
const SidebarNavButton = ({ active, onClick, icon: Icon, label, id, addTab, type, t, ...props }) => {
    const handleOpenNew = () => {
        addTab({ id: `${id}-${Date.now()}`, title: label, type: type || id });
    };
    const handleOpenSplit = () => {
        addTab({ id: `${id}-${Date.now()}`, title: label, type: type || id }, 'secondary');
    };
    return (_jsxs(ContextMenu.ContextMenu, { children: [_jsx(ContextMenu.ContextMenuTrigger, { children: _jsxs(Button, { variant: active ? 'default' : 'ghost', className: "w-full justify-start gap-2", onClick: onClick, ...props, children: [_jsx(Icon, { className: "w-4 h-4" }), label] }) }), _jsxs(ContextMenu.ContextMenuContent, { children: [_jsx(ContextMenu.ContextMenuItem, { onClick: handleOpenNew, children: t('sidebar.open_new_tab') }), _jsx(ContextMenu.ContextMenuItem, { onClick: handleOpenSplit, children: t('sidebar.open_split_view') })] })] }));
};
SidebarNavButton.propTypes = {
    active: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    addTab: PropTypes.func.isRequired,
    type: PropTypes.string,
    t: PropTypes.func.isRequired
};
const AppShell = ({ children }) => {
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [resizingTarget, setResizingTarget] = useState(null); // 'sidebar' | 'split' | null
    const [splitRatio, setSplitRatio] = useState(0.5);
    const [dragTarget, setDragTarget] = useState(null); // 'primary' | 'secondary' | null
    const { openTab, activeTabId, tabs, closeTab, isSplit, moveTabToGroup } = useTab();
    const { addTab } = useTabContext();
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
    const handleMouseMove = React.useCallback((e) => {
        if (resizingTarget === 'sidebar') {
            const newWidth = e.clientX;
            if (newWidth >= 200 && newWidth <= 400) {
                setSidebarWidth(newWidth);
            }
        }
        else if (resizingTarget === 'split') {
            const contentWidth = window.innerWidth - sidebarWidth;
            const relativeX = e.clientX - sidebarWidth;
            const newRatio = Math.min(Math.max(relativeX / contentWidth, 0.2), 0.8);
            setSplitRatio(newRatio);
        }
    }, [resizingTarget, sidebarWidth]);
    const handleMouseUp = React.useCallback(() => {
        setResizingTarget(null);
    }, []);
    useEffect(() => {
        if (resizingTarget) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingTarget, handleMouseMove, handleMouseUp]);
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
                    }
                    else {
                        window.electronAPI.window.close();
                    }
                }
            });
        }
        return () => {
            if (cleanupMenuListener)
                cleanupMenuListener();
        };
    }, [openTab, t, tabs, activeTabId, closeTab, addTab]);
    // Listen for file changes
    useEffect(() => {
        if (window.electronAPI?.file?.onFileChanged) {
            window.electronAPI.file.onFileChanged((data) => {
                // data can be { filePath, event } or just filePath depending on implementation
                // Assuming data object or string
                const path = typeof data === 'string' ? data : data.filePath;
                updateNotification({
                    content: (_jsx("div", { className: "flex items-center gap-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded animate-pulse", children: _jsx("span", { className: "text-xs font-medium", children: t('notifications.file_changed', { file: path.split(/[/\\]/).pop() }) }) }))
                });
                // Clear after 5 seconds
                const timer = setTimeout(() => {
                    updateNotification({ content: null });
                }, 5000);
                return () => clearTimeout(timer);
            });
        }
        return () => {
        };
    }, [updateNotification, t]);
    const handleToggleSidebar = () => {
        setSidebarWidth(prev => prev > 50 ? 50 : 250);
    };
    return (_jsxs("div", { className: "flex flex-col h-screen w-screen overflow-hidden", children: [_jsx(TitleBar, { className: "relative bg-background border-b border-border" }), _jsxs("div", { className: "flex flex-1 overflow-hidden", onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, children: [_jsxs("aside", { style: { width: `${sidebarWidth}px` }, className: "flex flex-col border-r border-border bg-card", children: [_jsx("div", { className: "p-4 border-b border-border", children: _jsx("h2", { className: "text-lg font-semibold", children: t('nav.title') }) }), _jsxs(ContextMenu.ContextMenu, { children: [_jsx(ContextMenu.ContextMenuTrigger, { className: "flex-1 overflow-y-auto", children: _jsxs("nav", { className: "flex-1 p-4 space-y-2", "data-tour": "sidebar-nav", children: [_jsx(SidebarNavButton, { active: activeTabId === 'home', onClick: () => nav('home', t('nav.home')), icon: House, label: t('nav.home'), id: "home", addTab: addTab, type: "home", "data-testid": "nav-home", t: t }), _jsxs("div", { className: "pt-4 pb-2", children: [_jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase px-3 pb-2", children: t('nav.sections.demos') }), _jsxs("div", { className: "space-y-1", children: [_jsx(SidebarNavButton, { active: activeTabId === 'data-management-demo', onClick: () => nav('data-management-demo', t('nav.items.data_mgmt')), icon: FloppyDisk, label: t('nav.items.data_mgmt'), id: "data-management-demo", addTab: addTab, "data-testid": "nav-data-management", t: t }), _jsx(SidebarNavButton, { active: activeTabId === 'connectivity-demo', onClick: () => nav('connectivity-demo', t('nav.items.connectivity')), icon: Globe, label: t('nav.items.connectivity'), id: "connectivity-demo", addTab: addTab, t: t }), _jsx(SidebarNavButton, { active: activeTabId === 'ipc-demo', onClick: () => nav('ipc-demo', t('nav.items.ipc')), icon: Plug, label: t('nav.items.ipc'), id: "ipc-demo", addTab: addTab, t: t }), _jsx(SidebarNavButton, { active: activeTabId === 'secure-storage-demo', onClick: () => nav('secure-storage-demo', t('nav.items.secure_storage')), icon: Lock, label: t('nav.items.secure_storage'), id: "secure-storage-demo", addTab: addTab, t: t }), _jsx(SidebarNavButton, { active: activeTabId === 'os-integration-demo', onClick: () => nav('os-integration-demo', t('nav.items.os_integration')), icon: Laptop, label: t('nav.items.os_integration'), id: "os-integration-demo", addTab: addTab, t: t })] })] }), _jsxs("div", { className: "pt-2 pb-2", children: [_jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase px-3 pb-2", children: t('nav.sections.data') }), _jsxs("div", { className: "space-y-1", children: [_jsx(SidebarNavButton, { active: activeTabId === 'backups', onClick: () => nav('backups', t('nav.items.backups')), icon: FloppyDisk, label: t('nav.items.backups'), id: "backups", addTab: addTab, t: t }), _jsx(SidebarNavButton, { active: activeTabId === 'sync', onClick: () => nav('sync', t('nav.items.sync_queue')), icon: ArrowsClockwise, label: t('nav.items.sync_queue'), id: "sync", addTab: addTab, t: t })] })] }), _jsxs("div", { className: "pt-2 pb-2", children: [_jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase px-3 pb-2", children: t('nav.sections.settings') }), _jsxs("div", { className: "space-y-1", children: [_jsx(SidebarNavButton, { active: activeTabId === 'settings', onClick: () => nav('settings', t('nav.items.settings')), icon: Gear, label: t('nav.items.settings'), id: "settings", addTab: addTab, "data-tour": "settings-link", "data-testid": "nav-settings", t: t }), _jsx(SidebarNavButton, { active: activeTabId === 'about', onClick: () => nav('about', t('nav.items.about')), icon: Info, label: t('nav.items.about'), id: "about", addTab: addTab, t: t })] })] }), isDevelopment && (_jsxs("div", { className: "pt-2 pb-2", children: [_jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase px-3 pb-2", children: t('nav.sections.development') }), _jsxs("div", { className: "space-y-1", children: [_jsx(SidebarNavButton, { active: activeTabId === 'test', onClick: () => nav('test', t('nav.items.test_playground')), icon: Flask, label: t('nav.items.test_playground'), id: "test", addTab: addTab, t: t }), _jsx(SidebarNavButton, { active: activeTabId === 'component-test', onClick: () => nav('component-test', t('nav.items.ui_playground')), icon: Flask, label: t('nav.items.ui_playground'), id: "component-test", addTab: addTab, t: t })] })] }))] }) }), _jsx(ContextMenu.ContextMenuContent, { children: _jsx(ContextMenu.ContextMenuItem, { onClick: handleToggleSidebar, children: sidebarWidth > 50 ? t('sidebar.collapse') : t('sidebar.expand') }) })] })] }), _jsx("div", { className: cn('w-1 cursor-col-resize hover:bg-primary/20 transition-colors', resizingTarget === 'sidebar' && 'bg-primary/40'), onMouseDown: handleMouseDown }), !isSplit ? (_jsxs("div", { className: "flex flex-col flex-1 overflow-hidden min-w-0", children: [_jsx(TabBar, { group: "primary" }), _jsxs("main", { className: cn("flex-1 relative overflow-hidden transition-all", dragTarget === 'secondary' && "bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-inset ring-blue-500"), onDragOver: (e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                    setDragTarget('secondary'); // Suggests moving to secondary (which will split)
                                }, onDragLeave: (e) => {
                                    if (e.currentTarget.contains(e.relatedTarget))
                                        return;
                                    setDragTarget(null);
                                }, onDrop: (e) => {
                                    e.preventDefault();
                                    setDragTarget(null);
                                    const tabId = e.dataTransfer.getData('application/tab-id');
                                    if (tabId) {
                                        moveTabToGroup(tabId, 'secondary');
                                    }
                                }, children: [_jsx(TabContent, { group: "primary" }), dragTarget === 'secondary' && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none bg-background/50 backdrop-blur-[1px]", children: _jsx("span", { className: "bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm", children: t('sidebar.open_split_view') }) }))] })] })) : (_jsxs("div", { className: "flex flex-1 overflow-hidden min-w-0 relative", children: [_jsxs("div", { className: "flex flex-col overflow-hidden border-r border-border min-w-0", style: { flex: splitRatio }, children: [_jsx(TabBar, { group: "primary" }), _jsx("main", { className: cn("flex-1 relative overflow-hidden transition-all", dragTarget === 'primary' && "bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-inset ring-blue-500"), onDragOver: (e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            setDragTarget('primary');
                                        }, onDragLeave: (e) => {
                                            if (e.currentTarget.contains(e.relatedTarget))
                                                return;
                                            setDragTarget(null);
                                        }, onDrop: (e) => {
                                            e.preventDefault();
                                            setDragTarget(null);
                                            const tabId = e.dataTransfer.getData('application/tab-id');
                                            if (tabId) {
                                                moveTabToGroup(tabId, 'primary');
                                            }
                                        }, children: _jsx(TabContent, { group: "primary" }) })] }), _jsx("div", { className: cn("w-1 cursor-col-resize hover:bg-primary/20 transition-colors z-10", resizingTarget === 'split' && "bg-primary/40"), onMouseDown: (e) => {
                                    e.preventDefault();
                                    setResizingTarget('split');
                                } }), _jsxs("div", { className: "flex flex-col overflow-hidden min-w-0", style: { flex: 1 - splitRatio }, children: [_jsx(TabBar, { group: "secondary" }), _jsx("main", { className: cn("flex-1 relative overflow-hidden transition-all", dragTarget === 'secondary' && "bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-inset ring-blue-500"), onDragOver: (e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            setDragTarget('secondary');
                                        }, onDragLeave: (e) => {
                                            if (e.currentTarget.contains(e.relatedTarget))
                                                return;
                                            setDragTarget(null);
                                        }, onDrop: (e) => {
                                            e.preventDefault();
                                            setDragTarget(null);
                                            const tabId = e.dataTransfer.getData('application/tab-id');
                                            if (tabId) {
                                                moveTabToGroup(tabId, 'secondary');
                                            }
                                        }, children: _jsx(TabContent, { group: "secondary" }) })] })] }))] }), _jsx(StatusBar, {})] }));
};
AppShell.propTypes = {
    children: PropTypes.node.isRequired,
};
export default AppShell;
