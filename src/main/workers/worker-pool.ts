import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WorkerTask<T = any> {
  workerData: T;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  onProgress?: (data: any) => void;
}

interface WorkerMessage {
  type: 'complete' | 'error' | 'progress';
  error?: string;
  data?: any;
  progress?: number;
}

/**
 * WorkerPool Class
 * Manages a pool of worker threads
 */
export class WorkerPool {
  private workerPath: string;
  private poolSize: number;
  private workers: Worker[];
  private availableWorkers: Worker[];
  private taskQueue: WorkerTask[];

  constructor(workerPath: string, poolSize: number = 2) {
    this.workerPath = workerPath;
    this.poolSize = poolSize;
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];

    this.initialize();
  }

  /**
   * Initialize worker pool
   */
  initialize() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerPath);
      this.workers.push(worker);
      this.availableWorkers.push(worker);

      worker.on('error', (error: Error) => {
        logger.error(`Worker error:`, error);
      });

      worker.on('exit', (code: number) => {
        if (code !== 0) {
          logger.error(`Worker stopped with exit code ${code}`);

          // Remove from pools
          this.workers = this.workers.filter(w => w !== worker);
          this.availableWorkers = this.availableWorkers.filter(w => w !== worker);

          // Replace with new worker
          const newWorker = new Worker(this.workerPath);
          this.workers.push(newWorker);
          this.availableWorkers.push(newWorker);
        }
      });
    }

    logger.info(`Initialized worker pool with ${this.poolSize} workers`);
  }

  /**
   * Execute task with worker
   */
  async execute<T>(workerData: T): Promise<any> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask<T> = { workerData, resolve, reject };

      // If worker available, execute immediately
      if (this.availableWorkers.length > 0) {
        this.runTask(task);
      } else {
        // Queue task for later
        this.taskQueue.push(task);
      }
    });
  }

  /**
   * Run task on available worker
   */
  runTask(task: WorkerTask) {
    const worker = this.availableWorkers.shift();

    if (!worker) {
      this.taskQueue.push(task);
      return;
    }

    const messageHandler = (message: WorkerMessage) => {
      if (message.type === 'complete') {
        cleanup();
        task.resolve(message);
      } else if (message.type === 'error') {
        cleanup();
        task.reject(new Error(message.error));
      } else if (message.type === 'progress') {
        // Progress updates don't complete the task
        if (task.onProgress) {
          task.onProgress(message);
        }
      }
    };

    const errorHandler = (error: Error) => {
      cleanup();
      task.reject(error);
    };

    const cleanup = () => {
      worker.removeListener('message', messageHandler);
      worker.removeListener('error', errorHandler);

      // Return worker to pool
      this.availableWorkers.push(worker);

      // Process next queued task
      if (this.taskQueue.length > 0) {
        const nextTask = this.taskQueue.shift();
        if (nextTask) { // Check existence due to shift() potentially returning undefined
          this.runTask(nextTask);
        }
      }
    };

    worker.on('message', messageHandler);
    worker.on('error', errorHandler);

    // Send task data to worker
    worker.postMessage(task.workerData);
  }

  /**
   * Terminate all workers
   */
  async terminate() {
    const terminations = this.workers.map(worker => worker.terminate());
    await Promise.all(terminations);
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];

    logger.info('Worker pool terminated');
  }

  /**
   * Get pool status
   */
  getStatus() {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      queuedTasks: this.taskQueue.length,
      activeWorkers: this.workers.length - this.availableWorkers.length
    };
  }
}

// Global worker pools
let zipWorkerPool: WorkerPool | null = null;
let csvWorkerPool: WorkerPool | null = null;

/**
 * Get ZIP worker pool (singleton)
 */
export function getZipWorkerPool(): WorkerPool {
  if (!zipWorkerPool) {
    const zipWorkerPath = path.join(__dirname, 'zip-worker.ts');
    zipWorkerPool = new WorkerPool(zipWorkerPath, 2);
  }
  return zipWorkerPool;
}

/**
 * Get CSV worker pool (singleton)
 */
export function getCsvWorkerPool(): WorkerPool {
  if (!csvWorkerPool) {
    const csvWorkerPath = path.join(__dirname, 'csv-worker.ts');
    csvWorkerPool = new WorkerPool(csvWorkerPath, 2);
  }
  return csvWorkerPool;
}

/**
 * Terminate all worker pools
 */
export async function terminateAllPools() {
  const terminations = [];

  if (zipWorkerPool) {
    terminations.push(zipWorkerPool.terminate());
    zipWorkerPool = null;
  }

  if (csvWorkerPool) {
    terminations.push(csvWorkerPool.terminate());
    csvWorkerPool = null;
  }

  await Promise.all(terminations);
}

export default {
  WorkerPool,
  getZipWorkerPool,
  getCsvWorkerPool,
  terminateAllPools
};
