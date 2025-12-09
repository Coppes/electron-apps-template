import React, { createContext, useContext, useState, useCallback } from 'react';

const TabContext = createContext({
  tabs: [],
  activeTabId: null,
  addTab: () => { },
  closeTab: () => { },
  setActiveTab: () => { },
  updateTab: () => { },
});

export const useTabContext = () => useContext(TabContext);

export const TabProvider = ({ children }) => {
  const [tabs, setTabs] = useState([
    { id: 'home', title: 'Home', type: 'page', data: {} } // Default tab
  ]);
  const [activeTabId, setActiveTabId] = useState('home');

  const addTab = useCallback((tab) => {
    setTabs((prev) => {
      // If tab exists (by ID), just activate it
      const existing = prev.find((t) => t.id === tab.id);
      if (existing) {
        return prev;
      }
      return [...prev, tab];
    });
    setActiveTabId(tab.id);
  }, []);

  const closeTab = useCallback((id) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== id);

      // If we closed the active tab, activate the last one
      if (id === activeTabId && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        // Ensure at least Home is open? Or allow empty?
        // Let's ensure Home is always open if empty
        return [{ id: 'home', title: 'Home', type: 'page', data: {} }];
      }

      return newTabs;
    });
  }, [activeTabId]);

  const updateTab = useCallback((id, updates) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        closeTab,
        setActiveTab: setActiveTabId,
        updateTab,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};
