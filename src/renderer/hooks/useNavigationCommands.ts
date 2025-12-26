import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRegisterCommand } from './useRegisterCommand';
import { useTabContext } from '../contexts/TabContext';

/**
 * Registers global navigation commands for the Command Palette
 * to interact with the Tab System.
 */
export function useNavigationCommands() {
  const { addTab, tabs, setActiveTab } = useTabContext();
  const { t } = useTranslation('common');

  // Helper to open a tab or activate existing one
  const openTab = React.useCallback((type: string, title: string) => {
    // Check if tab of this type already exists (for singleton pages)
    const existingStart = tabs.find(t => t.type === type);
    if (existingStart) {
      setActiveTab(existingStart.id);
      return;
    }

    // Also check secondary tabs if we supported split view deeply here, 
    // but primary check is sufficient for now as useTabContext handles global ID lookup in setActiveTab

    addTab({
      id: `${type}-${Date.now()}`,
      title,
      type,
      data: {}
    });
  }, [addTab, tabs, setActiveTab]);

  // Memoize command actions
  const openHome = React.useCallback(() => openTab('home', t('nav.home')), [openTab, t]);
  const openSettings = React.useCallback(() => openTab('settings', t('nav.items.settings')), [openTab, t]);
  const openDemo = React.useCallback(() => openTab('demo', t('nav.items.legacy_demo')), [openTab, t]);
  const openTest = React.useCallback(() => openTab('test', t('nav.items.test_playground')), [openTab, t]);

  useRegisterCommand(React.useMemo(() => ({
    id: 'nav-home-new',
    label: t('command.open_in_new_tab', { item: t('nav.home') }),
    group: 'Navigation',
    action: openHome,
    keywords: ['Open Home in New Tab']
  }), [openHome, t]));

  useRegisterCommand(React.useMemo(() => ({
    id: 'nav-settings-new',
    label: t('command.open_in_new_tab', { item: t('nav.items.settings') }),
    group: 'Navigation',
    action: openSettings,
    keywords: ['Open Settings in New Tab']
  }), [openSettings, t]));

  useRegisterCommand(React.useMemo(() => ({
    id: 'nav-demo-new',
    label: t('command.open_in_new_tab', { item: t('nav.items.legacy_demo') }),
    group: 'Navigation',
    action: openDemo,
    keywords: ['Open Demo in New Tab']
  }), [openDemo, t]));

  useRegisterCommand(React.useMemo(() => ({
    id: 'nav-test-new',
    label: t('command.open_in_new_tab', { item: t('nav.items.test_playground') }),
    group: 'Navigation',
    action: openTest,
    keywords: ['Open Test Page in New Tab']
  }), [openTest, t]));

  // Note: We could add a generic "Open New Tab..." command 
  // that opens a submenu, but cmdk v1 doesn't support nested menus easily
  // without state management. For now, flat commands are easier.
}
