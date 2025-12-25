/**
 * Hook for monitoring system power state
 * @returns {string} Current power status (e.g., 'on-ac', 'on-battery', 'suspend', 'resume', 'unknown')
 */
export declare function usePowerMonitor(): {
    status: string;
    lastEventTime: any;
};
