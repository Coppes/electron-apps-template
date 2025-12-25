/**
 * Worker Pool Manager
 * Manages worker threads for CPU-intensive operations
 */

import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * WorkerPool Class
 * Manages a pool of worker threads
 */
export class WorkerPool {
  constructor(workerPath, poolSize = 2) {
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

      worker.on('error', (error) => {
        logger.error(`Worker error:`, error);
      });

      worker.on('exit', (code) => {
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
  async execute(workerData) {
    return new Promise((resolve, reject) => {
      const task = { workerData, resolve, reject };

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
  runTask(task) {
    const worker = this.availableWorkers.shift();
    
    if (!worker) {
      this.taskQueue.push(task);
      return;
    }

    const messageHandler = (message) => {
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

    const errorHandler = (error) => {
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
        this.runTask(nextTask);
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
let zipWorkerPool = null;
let csvWorkerPool = null;

/**
 * Get ZIP worker pool (singleton)
 */
export function getZipWorkerPool() {
  if (!zipWorkerPool) {
    const zipWorkerPath = path.join(__dirname, 'zip-worker.ts');
    zipWorkerPool = new WorkerPool(zipWorkerPath, 2);
  }
  return zipWorkerPool;
}

/**
 * Get CSV worker pool (singleton)
 */
export function getCsvWorkerPool() {
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
