/**
 * Hook for interacting with Dock (macOS) and Taskbar (Windows)
 * @returns {Object} Dock integration methods
 */
export declare function useDock(): {
    setBadge: (text: any) => Promise<any>;
    setMenu: (template: any) => Promise<any>;
};
