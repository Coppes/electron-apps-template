/**
 * useOfflineStatus Hook
 * Custom React hook for monitoring network connectivity
 */
/**
 * Hook for monitoring online/offline status
 * @returns {object} Online status and utilities
 */
export declare function useOfflineStatus(): {
    isOnline: boolean;
    isOffline: boolean;
    lastCheck: any;
    checkNow: () => Promise<void>;
};
export default useOfflineStatus;
