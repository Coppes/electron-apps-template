import React, { createContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

export interface StatusBarItem {
  id: string;
  [key: string]: any;
}

export const StatusBarContext = createContext<{
  items: StatusBarItem[];
  addItem: (item: StatusBarItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<StatusBarItem>) => void;
}>({
  items: [],
  addItem: () => { },
  removeItem: () => { },
  updateItem: () => { },
});

export const StatusBarProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<StatusBarItem[]>([]);

  const addItem = useCallback((item: StatusBarItem) => {
    setItems((prev) => {
      // Avoid duplicates by ID
      const exists = prev.some((i) => i.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<StatusBarItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  return (
    <StatusBarContext.Provider value={{ items, addItem, removeItem, updateItem }}>
      {children}
    </StatusBarContext.Provider>
  );
};

StatusBarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
