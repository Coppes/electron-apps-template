import { useContext, useEffect, useRef } from 'react';
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
  const pendingUpdateRef = useRef(null);

  // Register item on mount
  useEffect(() => {
    addItem(item);
    return () => {
      removeItem(item.id);
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []); // Only run once on mount

  // Shared throttling logic
  const handleUpdate = (updates) => {
    if (!throttleTimeoutRef.current) {
      updateItem(itemIdRef.current, updates);

      throttleTimeoutRef.current = setTimeout(() => {
        throttleTimeoutRef.current = null;
        if (pendingUpdateRef.current) {
          updateItem(itemIdRef.current, pendingUpdateRef.current);
          pendingUpdateRef.current = null;
        }
      }, 1000);
    } else {
      // Merge pending updates
      pendingUpdateRef.current = { ...(pendingUpdateRef.current || {}), ...updates };
    }
  };

  // Update item when props change
  useEffect(() => {
    handleUpdate(item);
  }, [item.content, item.position, item.priority]);

  return {
    update: handleUpdate,
  };
}


