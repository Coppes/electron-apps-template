/**
 * Backup Manager
 * Handles backup and restore operations for application data
 */
/**
 * Backup Manager Class
 * Manages backup creation, restoration, and history
 */
export declare class BackupManager {
    constructor(options?: {});
    /**
     * Initialize backup directory
     */
    initialize(): Promise<void>;
    /**
     * Create a backup
     * @param {object} options - Backup options
     * @returns {Promise<object>} Backup metadata
     */
    createBackup(options?: {}): Promise<{
        success: boolean;
        backup: any;
    }>;
    /**
     * Create backup using worker thread
     */
    createBackupWithWorker(backupPath: any, files: any, metadata: any, backupFilename: any): Promise<{
        success: boolean;
        backup: any;
    }>;
    /**
     * Collect files for backup
     */
    collectFiles(includeDatabase: any, manifest: any): Promise<any[]>;
    /**
     * Add electron-store data to archive
     */
    addStoreData(archive: any, manifest: any): void;
    /**
     * Add database data to archive (conditional on add-secure-storage)
     */
    addDatabaseData(archive: any, manifest: any): Promise<void>;
    /**
     * Add user files to archive (optional)
     */
    addUserFiles(archive: any, manifest: any): Promise<void>;
    /**
     * Calculate file checksum (SHA-256)
     */
    calculateChecksum(filePath: any): Promise<unknown>;
    /**
     * Validate a backup file
     */
    validateBackup(filename: any): Promise<{
        isValid: boolean;
        error: string;
        size?: undefined;
    } | {
        isValid: boolean;
        size: number;
        error?: undefined;
    }>;
    /**
     * List all available backups
     */
    listBackups(): Promise<{
        success: boolean;
        backups: any[];
        total: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        backups: any[];
        total?: undefined;
    }>;
    /**
     * Delete a backup
     */
    deleteBackup(filename: any): Promise<{
        success: boolean;
        deleted: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        deleted?: undefined;
    }>;
    /**
     * Restore from backup
     */
    /**
     * Restore from backup
     */
    restoreBackup(filename: any): Promise<{
        success: boolean;
        message: string;
        backup: any;
    }>;
    /**
     * Add backup to history
     */
    addToHistory(filename: any, manifest: any): Promise<void>;
    /**
     * Cleanup old backups
     */
    cleanupOldBackups(): Promise<void>;
}
declare const backupManager: BackupManager;
export default backupManager;
