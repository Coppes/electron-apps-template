import { useContext, useEffect, useRef, useCallback } from 'react';
import { StatusBarContext } from '../contexts/StatusBarContext';

/**
 * Hook to register an item in the status bar
 * @param {Object} item - Status bar item configuration
 * @param {string} item.id - Unique ID
 * @param {React.ReactNode} item.content - Content to display
 * @param {string} [item.position] - 'left', 'center', 'right' (default: 'right')
 * @param {number} [item.priority] - Priority for sorting (higher = closer to edge)
 */
export function useStatusBar(item) {
  const { addItem, removeItem, updateItem } = useContext(StatusBarContext);
  const itemIdRef = useRef(item.id);
  const throttleTimeoutRef = useRef(null);
  // pendingUpdateRef was unused

  // Register item on mount
  useEffect(() => {
    addItem(item);
    return () => {
      removeItem(item.id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (throttleTimeoutRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(throttleTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Direct update without throttling
  const handleUpdate = useCallback((updates) => {
    updateItem(itemIdRef.current, updates);
  }, [updateItem]);

  // Update item when props change
  useEffect(() => {
    handleUpdate(item);
  }, [item.content, item.position, item.priority, handleUpdate]); // Removed item from deps

  return {
    update: handleUpdate,
  };
}


