/**
 * Hook to register an item in the status bar
 * @param {Object} item - Status bar item configuration
 * @param {string} item.id - Unique ID
 * @param {React.ReactNode} item.content - Content to display
 * @param {string} [item.position] - 'left', 'center', 'right' (default: 'right')
 * @param {number} [item.priority] - Priority for sorting (higher = closer to edge)
 */
export declare function useStatusBar(item: any): {
    update: (updates: any) => void;
};
