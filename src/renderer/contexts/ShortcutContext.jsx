import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ShortcutContext = createContext({
  shortcuts: [],
  registerShortcut: () => { },
  unregisterShortcut: () => { },
});

export const useShortcutContext = () => useContext(ShortcutContext);

export const ShortcutProvider = ({ children }) => {
  const [shortcuts, setShortcuts] = useState([]);

  const registerShortcut = useCallback((shortcut) => {
    setShortcuts((prev) => {
      // Remove existing with same id if any
      const filtered = prev.filter((s) => s.id !== shortcut.id);
      return [...filtered, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((id) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Global keydown handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if input/textarea is focused
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keys = shortcut.keys.toLowerCase().split('+');
        const match = keys.every((key) => {
          if (key === 'ctrl' || key === 'control') return event.ctrlKey;
          if (key === 'cmd' || key === 'meta') return event.metaKey;
          if (key === 'shift') return event.shiftKey;
          if (key === 'alt') return event.altKey;
          return event.key.toLowerCase() === key;
        });

        if (match) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <ShortcutContext.Provider value={{ shortcuts, registerShortcut, unregisterShortcut }}>
      {children}
    </ShortcutContext.Provider>
  );
};
