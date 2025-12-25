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
    const pendingUpdateRef = useRef(null);
    const lastUpdateRef = useRef(0);
    // Register item on mount
    useEffect(() => {
        addItem(item);
        return () => {
            removeItem(item.id);
            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount
    // Throttled update function
    const handleUpdate = useCallback((updates) => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateRef.current;
        // If it's been more than 1s since last update, update immediately
        if (timeSinceLastUpdate >= 1000) {
            updateItem(itemIdRef.current, updates);
            lastUpdateRef.current = now;
            // Clear any pending timeout
            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current);
                throttleTimeoutRef.current = null;
                pendingUpdateRef.current = null;
            }
        }
        else {
            // Otherwise, schedule update for later
            pendingUpdateRef.current = updates;
            if (!throttleTimeoutRef.current) {
                const delay = 1000 - timeSinceLastUpdate;
                throttleTimeoutRef.current = setTimeout(() => {
                    if (pendingUpdateRef.current) {
                        updateItem(itemIdRef.current, pendingUpdateRef.current);
                        lastUpdateRef.current = Date.now();
                        pendingUpdateRef.current = null;
                    }
                    throttleTimeoutRef.current = null;
                }, delay);
            }
        }
    }, [updateItem]);
    // Update item when props change
    // Update item when props change
    useEffect(() => {
        handleUpdate({
            id: item.id,
            content: item.content,
            position: item.position,
            priority: item.priority,
        });
    }, [item.id, item.content, item.position, item.priority, handleUpdate]);
    return {
        update: handleUpdate,
    };
}
