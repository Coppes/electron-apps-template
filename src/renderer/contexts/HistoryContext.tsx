import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSettings } from './SettingsContext';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

interface CommandAction {
  execute: () => void;
  undo: () => void;
  label?: string;
  [key: string]: any;
}

interface HistoryState {
  past: CommandAction[];
  future: CommandAction[];
}

interface HistoryContextType {
  execute: (command: CommandAction) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  history: HistoryState;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSettings();

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    future: []
  });

  const maxStackSize = settings.history?.maxStackSize || 50;

  // Enforce stack size limit when setting changes
  useEffect(() => {
    // Defer update to avoid "update while rendering" warning
    const timer = setTimeout(() => {
      setHistory(prev => {
        if (prev.past.length > maxStackSize) {
          return {
            ...prev,
            past: prev.past.slice(prev.past.length - maxStackSize)
          };
        }
        return prev;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [maxStackSize]);

  // Command interface: { execute: () => void, undo: () => void, label?: string }

  // Forward declarations for use in shortcuts
  // We can't use 'undo' variable before initialization if we use referencing before declaration.
  // But we can use a ref or just rely on the stable identity if we define them via useCallback first?
  // Actually, we need to define undo/redo BEFORE calling useKeyboardShortcut if we pass them as actions.
  // But useKeyboardShortcut needs to be at top level.
  // Solution: Define handlers using useCallback, then call useKeyboardShortcut.
  // BUT: replace_file_content targets a specific line.
  // Let's modify the file to place useKeyboardShortcut AFTER the callback definitions.
  // Or use a wrapper function.

  // Wait, I can't easily insert code *after* existing methods using this tool if I'm targeting the top.
  // I should use the `execute` method definition line as a marker or just rewrite the component body logic order.
  // Actually, the previous tool call inserted imports. Now I need to add the hooks.
  // I will append the hooks near the end of the component, just before return.


  const execute = useCallback((command: CommandAction) => {
    try {
      command.execute();
      setHistory(prev => {
        const newPast = [...prev.past, command];
        if (newPast.length > maxStackSize) {
          newPast.shift();
        }
        return {
          past: newPast,
          future: [] // Clear future on new action
        };
      });
    } catch (error) {
      // console.error('Failed to execute command:', error);
    }
  }, [maxStackSize]);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;

      const newPast = [...prev.past];
      const command = newPast.pop();

      if (!command) return prev; // Should not happen given length check, but satisfies types

      try {
        command.undo();
        return {
          past: newPast,
          future: [command, ...prev.future]
        };
      } catch (error) {
        // console.error('Failed to undo command:', error);
        // If undo fails, state might be inconsistent. 
        // We keep it popped or try to recover? For now, risk data loss vs stuck state.
        return {
          past: newPast, // It's popped
          future: [command, ...prev.future]
        };
      }
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;

      const newFuture = [...prev.future];
      const command = newFuture.shift();

      if (!command) return prev;

      try {
        command.execute();

        // Success: Move to past
        return {
          past: [...prev.past, command],
          future: newFuture
        };
      } catch (error) {
        // console.error('Failed to redo command:', error);
        // If it failed, do we keep it in future? Or move to past?
        // Standard: If it throws, state is undefined. Keep in future to retry?
        return prev;
      }
    });
  }, []);

  const clear = useCallback(() => {
    setHistory({ past: [], future: [] });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  useKeyboardShortcut({
    id: 'undo',
    keys: 'Mod+Z',
    action: undo,
    description: 'Undo last action',
    allowInInput: true
  });

  useKeyboardShortcut({
    id: 'redo',
    keys: 'Mod+Shift+Z',
    action: redo,
    description: 'Redo last action',
    allowInInput: true
  });

  return (
    <HistoryContext.Provider value={{
      execute,
      undo,
      redo,
      clear,
      canUndo,
      canRedo,
      history // exposed for analysis/UI if needed
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

HistoryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
