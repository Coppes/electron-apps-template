import { useEffect } from 'react';
import { useShortcutContext } from '../contexts/ShortcutContext';

/**
 * Hook to register a keyboard shortcut
 * @param {Object} options
 * @param {string} options.id - Unique ID
 * @param {string} options.keys - Key combo (e.g. "Ctrl+K")
 * @param {Function} options.action - Action to perform
 * @param {string} [options.description] - Description for UI
 */
export function useKeyboardShortcut({ id, keys, action, description }) {
  const { registerShortcut, unregisterShortcut } = useShortcutContext();

  useEffect(() => {
    registerShortcut({ id, keys, action, description });
    return () => unregisterShortcut(id);
  }, [id, keys, action, description, registerShortcut, unregisterShortcut]);
}
