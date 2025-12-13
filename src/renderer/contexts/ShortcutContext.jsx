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

  const importOverrides = useCallback(async (newOverrides) => {
    try {
      await window.electronAPI.store.set('keyboard-shortcuts', newOverrides);
      setUserOverrides(newOverrides);
    } catch (error) {
      console.error('Failed to import shortcuts:', error);
      throw error;
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
        const keys = effectiveKeyBinding.toLowerCase().split('+').map(k => k.trim());

        // Determine required modifiers
        const requiredModifiers = {
          ctrl: keys.includes('ctrl') || keys.includes('control'),
          meta: keys.includes('cmd') || keys.includes('meta') || keys.includes('mod'), // treat mod as meta/ctrl generic
          shift: keys.includes('shift'),
          alt: keys.includes('alt')
        };

        // "Mod" usually implies Meta on Mac, Ctrl on Win.
        // If we want to be precise:
        // If 'mod' is present, we require EITHER meta OR ctrl (depending on platform, but here we accept either).
        // But importantly: if 'shift' is NOT in keys, event.shiftKey MUST be false.

        // Check modifiers strictly
        // Note: event.ctrlKey on Mac is distinct from Cmd (metaKey).
        // If 'mod' is used, we usually mean the primary command key.

        const hasCtrl = event.ctrlKey;
        const hasMeta = event.metaKey;
        const hasShift = event.shiftKey;
        const hasAlt = event.altKey;

        // Check mismatch causing extra modifiers
        if (hasShift && !requiredModifiers.shift) continue;
        if (hasAlt && !requiredModifiers.alt) continue;

        // For Mod/Ctrl/Meta, it's trickier cross-platform.
        // Simplification:
        // If pattern has 'cmd'/'meta' -> require metaKey.
        // If pattern has 'ctrl' -> require ctrlKey.
        // If pattern has 'mod' -> require metaKey OR ctrlKey.
        // AND ensure we don't have the *other* if not requested.

        // Let's rely on the previous logic BUT add the "no extra" check.
        // Actually, just checking that every 'true' event modifier is accounted for in 'keys'.

        const eventModifiers = [];
        if (hasCtrl) eventModifiers.push('ctrl');
        if (hasMeta) eventModifiers.push('meta');
        if (hasShift) eventModifiers.push('shift');
        if (hasAlt) eventModifiers.push('alt');

        // Check if all event modifiers are allowed by the shortcut keys
        // 'mod' allows 'meta' OR 'ctrl'.
        const allowedModifiers = new Set(keys.filter(k => ['ctrl', 'control', 'cmd', 'meta', 'mod', 'shift', 'alt'].includes(k)));

        // We need to map 'control'->'ctrl', etc for comparison?
        // Let's do a logic check:
        // 1. All REQUIRED keys must be present (captured by .every check below, mostly)
        // 2. All EVENT modifiers must be ALLOWED.

        const isModifierAllowed = (mod) => {
          if (mod === 'shift') return allowedModifiers.has('shift');
          if (mod === 'alt') return allowedModifiers.has('alt');
          if (mod === 'ctrl') return allowedModifiers.has('ctrl') || allowedModifiers.has('control') || allowedModifiers.has('mod');
          if (mod === 'meta') return allowedModifiers.has('meta') || allowedModifiers.has('cmd') || allowedModifiers.has('mod');
          return false;
        };

        const unexpectedModifier = eventModifiers.some(m => !isModifierAllowed(m));
        if (unexpectedModifier) continue;

        if (unexpectedModifier) continue;

        const match = keys.every((key) => {
          const k = key.trim();

          // Check if modifier key is actually pressed
          if (k === 'ctrl' || k === 'control') return hasCtrl;
          if (k === 'cmd' || k === 'meta') return hasMeta;
          if (k === 'mod') return (hasMeta || hasCtrl);
          if (k === 'shift') return hasShift;
          if (k === 'alt') return hasAlt;

          // Non-modifier key match
          return event.key.toLowerCase() === k;
        });

        if (!match) continue;

        // One edge case: 'mod' requires EITHER. If I press Ctrl+Cmd+Z?
        // keys=['mod', 'z']. allowed=['mod'].
        // event=['ctrl', 'meta'].
        // isModifierAllowed('ctrl') -> True (mod).
        // isModifierAllowed('meta') -> True (mod).
        // unexpected = False.
        // match -> True.
        // So Ctrl+Cmd+Z would trigger Mod+Z.
        // This is usually acceptable, or we can say Mod matches EXACTLY one? 
        // For now, acceptable. Using two command keys is rare/user error.

        if (match) {
          event.preventDefault();
          event.stopPropagation(); // Stop bubbling to be safe
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true }); // Use capture to intercept before browser inputs?
    // Actually, React synth events bubble. Native events capture.
    // If we use capture: true, we get it first.
    // But we need to be careful not to break normal typing if we match too aggressively.
    // Our matching logic checks modifiers, so it should be safe.
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [shortcuts, userOverrides]);

  return (
    <ShortcutContext.Provider value={{ shortcuts, registerShortcut, unregisterShortcut, updateShortcut, resetToDefaults, importOverrides, userOverrides }}>
      {children}
    </ShortcutContext.Provider>
  );
};
