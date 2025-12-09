import React, { createContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

export const StatusBarContext = createContext({
  items: [],
  addItem: () => { },
  removeItem: () => { },
  updateItem: () => { },
});

export const StatusBarProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = useCallback((item) => {
    setItems((prev) => {
      // Avoid duplicates by ID
      const exists = prev.some((i) => i.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id, updates) => {
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
