import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export const TabContext = createContext({
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

  const closeAllTabs = useCallback(() => {
    setTabs([{ id: 'home', title: 'Home', type: 'page', data: {} }]);
    setActiveTabId('home');
  }, []);

  const closeOtherTabs = useCallback((keepId) => {
    setTabs((prev) => {
      const keep = prev.find(t => t.id === keepId);
      if (!keep) return prev;
      return [keep];
    });
    setActiveTabId(keepId);
  }, []);

  const reorderTab = useCallback((fromIndex, toIndex, group = 'primary') => {
    const updateFn = group === 'primary' ? setTabs : setSecondaryTabs;

    updateFn((prev) => {
      const newTabs = [...prev];
      if (fromIndex < 0 || fromIndex >= newTabs.length) return prev;

      const [movedTab] = newTabs.splice(fromIndex, 1);
      // Clamp toIndex
      const targetIndex = Math.max(0, Math.min(toIndex, newTabs.length));
      newTabs.splice(targetIndex, 0, movedTab);
      return newTabs;
    });
  }, []);

  /* Split View State */
  const [isSplit, setIsSplit] = useState(false);
  const [secondaryTabs, setSecondaryTabs] = useState([]);
  const [secondaryActiveTabId, setSecondaryActiveTabId] = useState(null);
  const [activeGroup, setActiveGroup] = useState('primary'); // 'primary' | 'secondary'

  const toggleSplit = useCallback(() => {
    setIsSplit((prev) => !prev);
    // If disabling, move secondary tabs back to primary?
    if (isSplit) {
      setTabs(prev => [...prev, ...secondaryTabs]);
      setSecondaryTabs([]);
      setSecondaryActiveTabId(null);
      setActiveGroup('primary');
    }
  }, [isSplit, secondaryTabs]);

  const moveTabToGroup = useCallback((tabId, targetGroup) => {
    // 1. Identify source group and tab object
    let tab = tabs.find(t => t.id === tabId);
    let sourceGroup = 'primary';
    if (!tab) {
      tab = secondaryTabs.find(t => t.id === tabId);
      sourceGroup = 'secondary';
    }

    if (!tab || sourceGroup === targetGroup) return;

    // 2. Remove from source
    if (sourceGroup === 'primary') {
      setTabs(prev => {
        const newTabs = prev.filter(t => t.id !== tabId);
        // If primary becomes empty, we force at least one tab or handle empty state?
        // Let's allow empty if split view is active, but if it's the ONLY tab in the whole app?
        // If moving to secondary, secondary will have it.
        // We need to update activeTabId if the active one was moved
        if (activeTabId === tabId) {
          // Activate adjacent or null?
          // If we rely on useEffect or subsequent render to fix activeTabId, it might be jittery.
          // Let's pick the last one remaining.
          if (newTabs.length > 0) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
          } else {
            // Primary empty.
            setActiveTabId(null);
          }
        }
        return newTabs;
      });
    } else {
      setSecondaryTabs(prev => {
        const newTabs = prev.filter(t => t.id !== tabId);
        if (secondaryActiveTabId === tabId) {
          if (newTabs.length > 0) {
            setSecondaryActiveTabId(newTabs[newTabs.length - 1].id);
          } else {
            setSecondaryActiveTabId(null);
          }
        }
        return newTabs;
      });
    }

    // 3. Add to target
    if (targetGroup === 'primary') {
      setTabs(prev => {
        const newTabs = [...prev, tab];
        return newTabs;
      });
      setActiveTabId(tab.id); // Activate the moved tab
    } else {
      setSecondaryTabs(prev => {
        const newTabs = [...prev, tab];
        return newTabs;
      });
      setSecondaryActiveTabId(tab.id); // Activate the moved tab
      setIsSplit(true);
    }

    setActiveGroup(targetGroup);
  }, [tabs, secondaryTabs, activeTabId, secondaryActiveTabId]);

  const [draggingTab, setDraggingTab] = useState(null); // { id, group, index }

  // Auto-close split view logic
  useEffect(() => {
    if (isSplit) {
      // If secondary is empty, just close split (revert to primary)
      if (secondaryTabs.length === 0) {
        setIsSplit(false);
        setActiveGroup('primary');
        setSecondaryActiveTabId(null);
      }
      // If primary is empty but secondary has tabs, promote secondary to primary
      else if (tabs.length === 0) {
        setTabs(secondaryTabs);
        setSecondaryTabs([]);
        // This setActiveTab refers to the function defined in the context value below.
        // For this to work, setActiveTab needs to be memoized or its dependencies handled.
        // For now, we'll assume it's available or will be refactored.
        // A safer approach would be to directly call setActiveTabId and setActiveGroup.
        setActiveTabId(secondaryActiveTabId); // Directly set primary active tab
        setActiveGroup('primary'); // Ensure primary group is active
        setIsSplit(false);
        setSecondaryActiveTabId(null);
      }
    }
  }, [isSplit, secondaryTabs, tabs, secondaryActiveTabId, setActiveTabId, setActiveGroup]); // Added setActiveTabId and setActiveGroup to dependencies

  // Enhanced closeTab to handle groups
  const closeTabEnhanced = useCallback((id) => {
    // Check primary
    if (tabs.some(t => t.id === id)) {
      closeTab(id);
      return;
    }
    // Check secondary
    if (secondaryTabs.some(t => t.id === id)) {
      setSecondaryTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== id);
        if (id === secondaryActiveTabId && newTabs.length > 0) {
          setSecondaryActiveTabId(newTabs[newTabs.length - 1].id);
        }
        return newTabs;
      });
    }
  }, [tabs, secondaryTabs, secondaryActiveTabId, closeTab]);

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        closeTab: closeTabEnhanced,
        setActiveTab: (id) => {
          if (tabs.some(t => t.id === id)) {
            setActiveTabId(id);
            setActiveGroup('primary');
          } else if (secondaryTabs.some(t => t.id === id)) {
            setSecondaryActiveTabId(id);
            setActiveGroup('secondary');
          }
        },
        updateTab,
        closeAllTabs,
        closeOtherTabs,
        reorderTab,
        // Split View
        isSplit,
        secondaryTabs,
        secondaryActiveTabId,
        activeGroup,
        toggleSplit,
        moveTabToGroup,
        setActiveGroup,
        draggingTab,
        setDraggingTab
      }}
    >
      {children}
    </TabContext.Provider>
  );
};
