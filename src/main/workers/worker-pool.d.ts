/**
 * Worker Pool Manager
 * Manages worker threads for CPU-intensive operations
 */
/**
 * WorkerPool Class
 * Manages a pool of worker threads
 */
export declare class WorkerPool {
    constructor(workerPath: any, poolSize?: number);
    /**
     * Initialize worker pool
     */
    initialize(): void;
    /**
     * Execute task with worker
     */
    execute(workerData: any): Promise<unknown>;
    /**
     * Run task on available worker
     */
    runTask(task: any): void;
    /**
     * Terminate all workers
     */
    terminate(): Promise<void>;
    /**
     * Get pool status
     */
    getStatus(): {
        totalWorkers: any;
        availableWorkers: any;
        queuedTasks: any;
        activeWorkers: number;
    };
}
/**
 * Get ZIP worker pool (singleton)
 */
export declare function getZipWorkerPool(): any;
/**
 * Get CSV worker pool (singleton)
 */
export declare function getCsvWorkerPool(): any;
/**
 * Terminate all worker pools
 */
export declare function terminateAllPools(): Promise<void>;
declare const _default: {
    WorkerPool: typeof WorkerPool;
    getZipWorkerPool: typeof getZipWorkerPool;
    getCsvWorkerPool: typeof getCsvWorkerPool;
    terminateAllPools: typeof terminateAllPools;
};
export default _default;
