import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ShortcutContext = createContext({
  shortcuts: [],
  registerShortcut: () => { },
  unregisterShortcut: () => { },
});

export const useShortcutContext = () => useContext(ShortcutContext);

export const ShortcutProvider = ({ children }) => {
  const [shortcuts, setShortcuts] = useState([]);
  const [userOverrides, setUserOverrides] = useState({});

  // Load user overrides on mount
  useEffect(() => {
    const loadOverrides = async () => {
      try {
        const overrides = await window.electronAPI.store.get('keyboard-shortcuts');
        if (overrides) {
          setUserOverrides(overrides);
        }
      } catch (error) {
        console.error('Failed to load shortcuts:', error);
      }
    };
    loadOverrides();
  }, []);

  const registerShortcut = useCallback((shortcut) => {
    setShortcuts((prev) => {
      // Remove existing with same id if any
      const filtered = prev.filter((s) => s.id !== shortcut.id);

      // Check for conflicts
      const isConflict = filtered.some(s => s.keys.toLowerCase() === shortcut.keys.toLowerCase());
      if (isConflict) {
        console.warn(`Shortcut conflict detected: ${shortcut.keys} is already bound.`);
        // Ideally we would trigger UI warning here or return failure
      }

      return [...filtered, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((id) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateShortcut = useCallback(async (id, newKeys) => {
    const shortcut = shortcuts.find(s => s.id === id);
    if (!shortcut) return;

    // Check blacklist
    const blacklist = ['cmd+q', 'ctrl+q', 'cmd+w', 'ctrl+w', 'cmd+n', 'ctrl+n'];
    if (blacklist.includes(newKeys.toLowerCase())) {
      throw new Error(`Shortcut ${newKeys} is reserved by the system.`);
    }

    // Check conflict (excluding self)
    const isConflict = shortcuts.some(s => s.id !== id && s.keys.toLowerCase() === newKeys.toLowerCase());
    if (isConflict) {
      throw new Error(`Shortcut ${newKeys} is already in use.`);
    }

    try {
      // Save to store
      const updatedOverrides = { ...userOverrides, [id]: newKeys };
      await window.electronAPI.store.set('keyboard-shortcuts', updatedOverrides);
      setUserOverrides(updatedOverrides);
    } catch (error) {
      console.error('Failed to save shortcut override:', error);
      throw error;
    }
  }, [shortcuts, userOverrides]);

  const resetToDefaults = useCallback(async () => {
    try {
      await window.electronAPI.store.delete('keyboard-shortcuts');
      setUserOverrides({});
    } catch (error) {
      console.error('Failed to reset shortcuts:', error);
    }
  }, []);

  // Global keydown handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if input/textarea is focused, UNLESS shortcut allows it
      const isInputFocused =
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable;

      for (const shortcut of shortcuts) {
        // If input is focused and shortcut doesn't allow it, skip
        if (isInputFocused && !shortcut.allowInInput) {
          continue;
        }

        // Use override key if available, else default
        const effectiveKeyBinding = userOverrides[shortcut.id] || shortcut.keys;
        const keys = effectiveKeyBinding.toLowerCase().split('+');

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
  }, [shortcuts, userOverrides]);

  return (
    <ShortcutContext.Provider value={{ shortcuts, registerShortcut, unregisterShortcut, updateShortcut, resetToDefaults, userOverrides }}>
      {children}
    </ShortcutContext.Provider>
  );
};
