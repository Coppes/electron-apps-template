import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRegisterCommand } from './useRegisterCommand';
import { useTabContext } from '../contexts/TabContext';

/**
 * Registers global navigation commands for the Command Palette
 * to interact with the Tab System.
 */
export function useNavigationCommands() {
  const { addTab } = useTabContext();
  const { t } = useTranslation('common');

  // Helper to open a new tab instance - Memoized
  const openNewTab = React.useCallback((type, title) => {
    addTab({
      id: `${type}-${Date.now()}`, // Unique ID for new instance
      title,
      type
    });
  }, [addTab]);

  // Memoize command actions
  const openHome = React.useCallback(() => openNewTab('home', t('nav.home')), [openNewTab, t]);
  const openSettings = React.useCallback(() => openNewTab('settings', t('nav.items.settings')), [openNewTab, t]);
  const openDemo = React.useCallback(() => openNewTab('demo', t('nav.items.legacy_demo')), [openNewTab, t]);
  const openTest = React.useCallback(() => openNewTab('test', t('nav.items.test_playground')), [openNewTab, t]);

  useRegisterCommand(React.useMemo(() => ({
    id: 'nav-home-new',
    label: 'Open Home in New Tab',
    group: 'Navigation',
    action: openHome
  }), [openHome]));

  useRegisterCommand(React.useMemo(() => ({
    id: 'nav-settings-new',
    label: 'Open Settings in New Tab',
    group: 'Navigation',
    action: openSettings
  }), [openSettings]));

  useRegisterCommand(React.useMemo(() => ({
    id: 'nav-demo-new',
    label: 'Open Demo in New Tab',
    group: 'Navigation',
    action: openDemo
  }), [openDemo]));

  useRegisterCommand(React.useMemo(() => ({
    id: 'nav-test-new',
    label: 'Open Test Page in New Tab',
    group: 'Navigation',
    action: openTest
  }), [openTest]));

  // Note: We could add a generic "Open New Tab..." command 
  // that opens a submenu, but cmdk v1 doesn't support nested menus easily
  // without state management. For now, flat commands are easier.
}
