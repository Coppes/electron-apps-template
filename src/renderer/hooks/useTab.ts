import { useTabContext } from '../contexts/TabContext';

export function useTab() {
  const context = useTabContext();

  return {
    openTab: (tab: any) => context.addTab(tab),
    closeTab: context.closeTab,
    activateTab: context.setActiveTab,
    activeTabId: context.activeTabId,
    tabs: context.tabs,
    // Split View
    isSplit: context.isSplit,
    toggleSplit: context.toggleSplit,
    moveTabToGroup: context.moveTabToGroup,
    secondaryTabs: context.secondaryTabs,
    secondaryActiveTabId: context.secondaryActiveTabId,
    activeGroup: context.activeGroup,
    setActiveGroup: context.setActiveGroup
  };
}
