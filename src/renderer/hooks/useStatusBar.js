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

  // Register item on mount
  useEffect(() => {
    addItem(item);
    return () => removeItem(item.id);
  }, []); // Only run once on mount

  // Update item when props change
  useEffect(() => {
    updateItem(item.id, item);
  }, [item.content, item.position, item.priority]); // Dependencies that trigger update

  return {
    update: (updates) => updateItem(itemIdRef.current, updates),
  };
}
