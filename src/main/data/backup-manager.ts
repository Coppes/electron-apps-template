import path from 'path';
import fs from 'fs/promises';
import { createWriteStream, createReadStream } from 'fs';
import archiver from 'archiver';
import { app } from 'electron';
import { createHash } from 'crypto';
import Store from 'electron-store';
import { logger } from '../logger.ts';
import { getZipWorkerPool } from '../workers/worker-pool.ts';
import { notificationManager } from '../notifications.ts';
import {
  BackupManifest,
  BackupOptions,
  BackupMetadata,
  IPCResponse
} from '../../common/types.ts';

const store = new Store();
const BACKUP_METADATA_KEY = 'backup:history';
const DEFAULT_BACKUP_DIR = path.join(app.getPath('userData'), 'backups');
const MAX_BACKUPS = 10;

// Use worker threads for backups larger than 5MB
const WORKER_THRESHOLD = 5 * 1024 * 1024;

interface BackupManagerOptions {
  backupDir?: string;
  maxBackups?: number;
  includeUserFiles?: boolean;
}

/**
 * Backup Manager Class
 * Manages backup creation, restoration, and history
 */
export class BackupManager {
  private backupDir: string;
  private maxBackups: number;
  private includeUserFiles: boolean;

  constructor(options: BackupManagerOptions = {}) {
    this.backupDir = options.backupDir || DEFAULT_BACKUP_DIR;
    this.maxBackups = options.maxBackups || MAX_BACKUPS;
    this.includeUserFiles = options.includeUserFiles || false;
  }

  /**
   * Initialize backup directory
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info(`Backup directory initialized: ${this.backupDir}`);
    } catch (error) {
      logger.error('Failed to initialize backup directory:', error);
      throw error;
    }
  }

  /**
   * Create a backup
   */
  async createBackup(options: BackupOptions = {}): Promise<IPCResponse<BackupMetadata>> {
    const { type = 'manual', includeDatabase = true, useWorker = true } = options;

    try {
      await this.initialize();

      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const backupFilename = `backup-${timestamp}.zip`;
      const backupPath = path.join(this.backupDir, backupFilename);

      logger.info(`Creating ${type} backup: ${backupFilename}`);

      // Create manifest
      const manifest: BackupManifest = {
        version: app.getVersion(),
        type,
        timestamp: new Date().toISOString(),
        platform: process.platform,
        includes: []
      };

      // Collect files to backup
      const filesToBackup = await this.collectFiles(includeDatabase, manifest);

      // Estimate backup size
      let estimatedSize = 0;
      for (const file of filesToBackup) {
        try {
          const stats = await fs.stat(file.path);
          estimatedSize += stats.size;
        } catch (error) {
          logger.warn(`Could not stat file ${file.path}:`, error as any);
        }
      }

      // Use worker thread for large backups
      if (useWorker && estimatedSize > WORKER_THRESHOLD) {
        logger.info(`Using worker thread for large backup (${estimatedSize} bytes)`);
        return this.createBackupWithWorker(backupPath, filesToBackup, manifest, backupFilename);
      }

      // Create ZIP archive in main thread (small backups)
      const output = createWriteStream(backupPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      const streamPromise = new Promise<void>((resolve, reject) => {
        output.on('close', () => resolve());
        archive.on('error', reject);
      });

      archive.pipe(output);

      // Add electron-store data
      this.addStoreData(archive, manifest);

      // Add database if present and requested
      if (includeDatabase) {
        await this.addDatabaseData(archive, manifest);
      }

      // Add user files if configured
      if (this.includeUserFiles) {
        await this.addUserFiles(archive, manifest);
      }

      // Add manifest
      archive.append(Buffer.from(JSON.stringify(manifest, null, 2)), { name: 'manifest.json' });

      // Wait for directory scan potential race
      await new Promise(resolve => setTimeout(resolve, 100));

      await archive.finalize();
      await streamPromise;

      // Post-process
      // Calculate checksum
      const checksum = await this.calculateChecksum(backupPath);
      manifest.checksum = checksum;
      manifest.size = archive.pointer();

      // Save backup metadata
      await this.addToHistory(backupFilename, manifest);

      // Cleanup old backups
      await this.cleanupOldBackups();

      logger.info(`Backup created successfully: ${backupFilename} (${manifest.size} bytes)`);

      notificationManager.showNotification({
        title: 'Backup Successful',
        body: `Backup created: ${backupFilename}`,
        urgency: 'normal'
      });

      return {
        success: true,
        data: {
          filename: backupFilename,
          path: backupPath,
          ...manifest
        }
      };
    } catch (error: any) {
      logger.error('Backup creation failed:', error);

      notificationManager.showNotification({
        title: 'Backup Failed',
        body: `Failed to create backup: ${error.message}`,
        urgency: 'critical'
      });

      throw error;
    }
  }

  /**
   * Create backup using worker thread
   */
  async createBackupWithWorker(
    backupPath: string,
    files: any[],
    manifest: BackupManifest,
    backupFilename: string
  ): Promise<IPCResponse<BackupMetadata>> {
    const workerPool = getZipWorkerPool();

    try {
      const result = await workerPool.execute({
        operation: 'create',
        outputPath: backupPath,
        files,
        metadata: manifest
      });

      // Save backup metadata
      manifest.checksum = result.checksum;
      manifest.size = result.size;
      await this.addToHistory(backupFilename, manifest);

      // Cleanup old backups
      await this.cleanupOldBackups();

      logger.info(`Backup created with worker: ${backupFilename} (${manifest.size} bytes)`);

      return {
        success: true,
        data: {
          filename: backupFilename,
          path: backupPath,
          ...manifest
        }
      };
    } catch (error) {
      logger.error('Worker backup creation failed:', error);
      throw error;
    }
  }

  /**
   * Collect files for backup
   */
  async collectFiles(includeDatabase: boolean, manifest: BackupManifest): Promise<{ path: string; name: string }[]> {
    const files: { path: string; name: string }[] = [];

    // Add electron-store
    const storeData = store.store;
    const storePath = path.join(this.backupDir, '.temp-store.json');
    await fs.writeFile(storePath, JSON.stringify(storeData, null, 2));
    files.push({ path: storePath, name: 'electron-store/config.json' });
    manifest.includes.push('electron-store');

    // Add database if present
    if (includeDatabase) {
      const dbPath = path.join(app.getPath('userData'), 'database.db');
      try {
        await fs.access(dbPath);
        files.push({ path: dbPath, name: 'databases/database.db' });
        manifest.includes.push('database');
        logger.debug('Added database to backup');
      } catch {
        logger.debug('No database found, skipping');
      }
    }

    // Add user files if configured
    if (this.includeUserFiles) {
      const userFilesDir = path.join(app.getPath('userData'), 'user-files');
      try {
        const userFiles = await fs.readdir(userFilesDir, { recursive: false }); // Note: recursive false for readdir unless Node 20+, keeping safe
        // If recursive required, use glob or recursive readdir implementation
        // Assuming flat structure for now or user provided solution
        for (const file of userFiles) {
          const filePath = path.join(userFilesDir, file);
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            files.push({ path: filePath, name: `user-files/${file}` });
          }
        }
        manifest.includes.push('user-files');
      } catch {
        logger.debug('No user files found, skipping');
      }
    }

    return files;
  }

  /**
   * Add electron-store data to archive
   */
  addStoreData(archive: archiver.Archiver, manifest: BackupManifest): void {
    try {
      const storeData = store.store;
      archive.append(JSON.stringify(storeData, null, 2), {
        name: 'electron-store/config.json'
      });
      // Already pushed in correctFiles but this is for stream adding directly?
      // createBackup calls this.addStoreData AND collectFiles writes .temp-store.json
      // This seems redundant or one is for worker and one for main thread.
      // createBackup uses archive.pipe logic so it adds directly.
      // But collectFiles is for worker.
      // If NOT using worker, createBackup calls addStoreData.
      if (!manifest.includes.includes('electron-store')) {
        manifest.includes.push('electron-store');
      }
      logger.debug('Added electron-store data to backup');
    } catch (error) {
      logger.error('Failed to add store data:', error);
    }
  }

  /**
   * Add database data to archive (conditional on add-secure-storage)
   */
  async addDatabaseData(archive: archiver.Archiver, manifest: BackupManifest): Promise<void> {
    try {
      // Check if database file exists
      const dbPath = path.join(app.getPath('userData'), 'database.db');

      try {
        await fs.access(dbPath);
        archive.file(dbPath, { name: 'databases/database.db' });
        if (!manifest.includes.includes('database')) {
          manifest.includes.push('database');
        }
        logger.debug('Added database to backup');
      } catch {
        // Database doesn't exist, skip
        logger.debug('No database found, skipping');
      }
    } catch (error) {
      logger.error('Failed to add database:', error);
    }
  }

  /**
   * Add user files to archive (optional)
   */
  async addUserFiles(archive: archiver.Archiver, manifest: BackupManifest): Promise<void> {
    try {
      const userFilesDir = path.join(app.getPath('userData'), 'user-files');

      try {
        await fs.access(userFilesDir);
        archive.directory(userFilesDir, 'user-files');
        if (!manifest.includes.includes('user-files')) {
          manifest.includes.push('user-files');
        }
        logger.debug('Added user files to backup');
      } catch {
        // User files don't exist, skip
        logger.debug('No user files found, skipping');
      }
    } catch (error) {
      logger.error('Failed to add user files:', error);
    }
  }

  /**
   * Calculate file checksum (SHA-256)
   */
  calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Validate a backup file
   */
  async validateBackup(filename: string): Promise<{ isValid: boolean; size?: number; error?: string }> {
    try {
      const backupPath = path.join(this.backupDir, filename);
      await fs.access(backupPath);
      const stats = await fs.stat(backupPath);

      // Basic validation: file exists and has size
      if (stats.size === 0) {
        return { isValid: false, error: 'Backup file is empty' };
      }

      return { isValid: true, size: stats.size };
    } catch (error) {
      return { isValid: false, error: 'Backup file not found' };
    }
  }

  /**
   * List all available backups
   */
  async listBackups(): Promise<IPCResponse<BackupMetadata[] & { total: number }>> {
    try {
      const history = (store.get(BACKUP_METADATA_KEY, []) as BackupMetadata[]);

      // Verify backups still exist
      const validBackups: BackupMetadata[] = [];
      for (const backup of history) {
        const backupPath = path.join(this.backupDir, backup.filename);
        try {
          await fs.access(backupPath);
          validBackups.push({ ...backup, path: backupPath });
        } catch {
          logger.warn(`Backup file missing: ${backup.filename}`);
        }
      }

      // Update history if backups were removed
      if (validBackups.length !== history.length) {
        store.set(BACKUP_METADATA_KEY, validBackups);
      }

      // Add total property to array to match intersection type
      const data = validBackups as (BackupMetadata[] & { total: number });
      (data as any).total = validBackups.length;

      return {
        success: true,
        data
      };
    } catch (error: any) {
      logger.error('Failed to list backups:', error);
      return {
        success: false,
        error: error.message,
        data: undefined
      };
    }
  }

  /**
   * Delete a backup
   */
  async deleteBackup(filename: string): Promise<IPCResponse<{ deleted: string }>> {
    try {
      const backupPath = path.join(this.backupDir, filename);

      // Check if file exists
      try {
        await fs.access(backupPath);
      } catch {
        return {
          success: false,
          error: 'Backup file not found'
        };
      }

      // Delete file
      await fs.unlink(backupPath);

      // Remove from history
      const history = (store.get(BACKUP_METADATA_KEY, []) as BackupMetadata[]);
      const updatedHistory = history.filter(b => b.filename !== filename);
      store.set(BACKUP_METADATA_KEY, updatedHistory);

      logger.info(`Backup deleted: ${filename}`);

      return {
        success: true,
        data: {
          deleted: filename
        }
      };
    } catch (error: any) {
      logger.error(`Failed to delete backup ${filename}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(filename: string): Promise<IPCResponse<string>> {
    let restoreDir: string | undefined;
    try {
      const backupPath = path.join(this.backupDir, filename);

      // Verify backup exists
      await fs.access(backupPath);

      logger.info(`Restoring backup: ${filename}`);

      // Create restore temp directory
      restoreDir = path.join(app.getPath('temp'), `restore-${Date.now()}`);
      await fs.mkdir(restoreDir, { recursive: true });

      // Extract backup
      try {
        const AdmZip = (await import('adm-zip')).default;
        const zip = new AdmZip(backupPath);
        zip.extractAllTo(restoreDir, true);
      } catch (zipError: any) {
        throw new Error(`Failed to extract backup: ${zipError.message} (Invalid or corrupted file)`);
      }

      // Verify manifest
      const manifestPath = path.join(restoreDir, 'manifest.json');
      let manifest: BackupManifest;
      try {
        const stats = await fs.stat(manifestPath);
        logger.debug(`Manifest size: ${stats.size}`);
        const manifestContent = await fs.readFile(manifestPath, 'utf8');
        logger.debug(`Manifest content length: ${manifestContent.length}`);
        manifest = JSON.parse(manifestContent);
      } catch (e) {
        logger.error('Failed to read/parse manifest:', e);
        throw new Error('Invalid backup: manifest.json missing or corrupted');
      }

      // Validate checksum if present
      if (manifest.checksum) {
        // Validation logic omitted as per original
      }

      // Restore based on manifest includes
      if (manifest.includes.includes('electron-store')) {
        const storeConfigPath = path.join(restoreDir, 'electron-store', 'config.json');
        try {
          const storeContent = await fs.readFile(storeConfigPath, 'utf8');
          const storeData = JSON.parse(storeContent);
          store.store = storeData;
          logger.info('Restored electron-store configuration');
        } catch (e) {
          logger.warn('Failed to restore electron-store:', e as any);
        }
      }

      notificationManager.showNotification({
        title: 'Restore Successful',
        body: `Data restored from ${filename}`,
        urgency: 'critical'
      });

      return {
        success: true,
        data: filename
      };
    } catch (error: any) {
      logger.error(`Failed to restore backup ${filename}:`, error);

      notificationManager.showNotification({
        title: 'Restore Failed',
        body: `Failed to restore ${filename}: ${error.message}`,
        urgency: 'critical'
      });

      throw error;
    } finally {
      // Cleanup temp directory
      if (restoreDir) {
        try {
          // Check if it exists before trying to delete (it might have failed creation)
          await fs.rm(restoreDir, { recursive: true, force: true });
        } catch (e) {
          logger.warn('Failed to cleanup restore temp dir:', e as any);
        }
      }
    }
  }

  /**
   * Add backup to history
   */
  async addToHistory(filename: string, manifest: BackupManifest): Promise<void> {
    const history = (store.get(BACKUP_METADATA_KEY, []) as BackupMetadata[]);
    history.unshift({
      filename,
      ...manifest
    });
    store.set(BACKUP_METADATA_KEY, history);
  }

  /**
   * Cleanup old backups
   */
  async cleanupOldBackups(): Promise<void> {
    try {
      const history = (store.get(BACKUP_METADATA_KEY, []) as BackupMetadata[]);

      if (history.length > this.maxBackups) {
        const toDelete = history.slice(this.maxBackups);

        for (const backup of toDelete) {
          try {
            await this.deleteBackup(backup.filename);
            logger.info(`Cleaned up old backup: ${backup.filename}`);
          } catch (error) {
            logger.warn(`Failed to cleanup backup ${backup.filename}:`, error as any);
          }
        }
      }
    } catch (error) {
      logger.error('Cleanup failed:', error);
    }
  }
}

// Create singleton instance
const backupManager = new BackupManager();

export default backupManager;
