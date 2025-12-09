import { useTabContext } from '../contexts/TabContext';

export function useTab() {
  const { addTab, closeTab, setActiveTab, activeTabId, tabs } = useTabContext();

  return {
    openTab: (tab) => addTab(tab),
    closeTab,
    activateTab: setActiveTab,
    activeTabId,
    tabs,
  };
}
