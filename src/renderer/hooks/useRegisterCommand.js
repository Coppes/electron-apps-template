import { useEffect } from 'react';
import { useCommandContext } from '../contexts/CommandContext';

/**
 * Hook to register a command in the command palette
 * @param {Object} options
 * @param {string} options.id - Unique ID
 * @param {string} options.label - Display label
 * @param {Function} options.action - Action to perform
 * @param {string} [options.group] - Group name (e.g. "Navigation")
 * @param {string} [options.shortcut] - Shortcut display string
 */
export function useRegisterCommand({ id, label, action, group = 'General', shortcut }) {
  const { registerCommand, unregisterCommand } = useCommandContext();

  useEffect(() => {
    registerCommand({ id, label, action, group, shortcut });
    return () => unregisterCommand(id);
  }, [id, label, action, group, shortcut, registerCommand, unregisterCommand]);
}
