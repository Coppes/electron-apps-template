/**
 * Data Management IPC Handlers
 * Handles backup/restore and import/export operations
 */

import { IPC_CHANNELS } from '../../../common/constants.js';
import backupManager from '../../data/backup-manager.js';
import importExportManager from '../../data/import-export.js';
import connectivityManager from '../../data/connectivity-manager.js';
import syncQueue from '../../data/sync-queue.js';
import { logger } from '../../logger.js';
import {
  backupLimiter,
  importExportLimiter,
  validateImportData
} from '../../security/data-security.js';

/**
 * Handle create backup request
 */
export async function handleCreateBackup(event, payload) {
  // Rate limiting
  if (!backupLimiter.isAllowed('create-backup')) {
    return {
      success: false,
      error: 'Too many backup operations. Please wait and try again.',
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  const { type = 'manual', includeDatabase = true } = payload || {};

  try {
    logger.info(`Creating ${type} backup...`);
    const result = await backupManager.createBackup({ type, includeDatabase });
    return result;
  } catch (error) {
    logger.error('Create backup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle list backups request
 */
export async function handleListBackups() {
  try {
    const result = await backupManager.listBackups();
    return result;
  } catch (error) {
    logger.error('List backups failed:', error);
    return {
      success: false,
      error: error.message,
      backups: []
    };
  }
}

/**
 * Handle restore backup request
 */
export async function handleRestoreBackup(event, payload) {
  const { filename } = payload || {};

  if (!filename) {
    return {
      success: false,
      error: 'Backup filename is required'
    };
  }

  try {
    logger.info(`Restoring backup: ${filename}`);
    const result = await backupManager.restoreBackup(filename);
    return result;
  } catch (error) {
    logger.error('Restore backup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle delete backup request
 */
export async function handleDeleteBackup(event, payload) {
  const { filename } = payload || {};

  if (!filename) {
    return {
      success: false,
      error: 'Backup filename is required'
    };
  }

  try {
    logger.info(`Deleting backup: ${filename}`);
    const result = await backupManager.deleteBackup(filename);
    return result;
  } catch (error) {
    logger.error('Delete backup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle data import request
 */
export async function handleDataImport(event, payload) {
  // Rate limiting
  if (!importExportLimiter.isAllowed('import')) {
    return {
      success: false,
      error: 'Too many import operations. Please wait and try again.',
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  const { filePath, options = {} } = payload || {};

  if (!filePath) {
    return {
      success: false,
      error: 'File path is required'
    };
  }

  try {
    logger.info(`Importing data from: ${filePath}`);
    const result = await importExportManager.import(filePath, options);

    // Validate imported data
    if (result.success && result.data) {
      const validation = validateImportData(result.data, {
        maxRecords: options.maxRecords || 10000,
        maxStringLength: options.maxStringLength || 1000000
      });

      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          code: validation.code
        };
      }
    }

    return result;
  } catch (error) {
    logger.error('Import failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle data export request
 */
export async function handleDataExport(event, payload) {
  // Rate limiting
  if (!importExportLimiter.isAllowed('export')) {
    return {
      success: false,
      error: 'Too many export operations. Please wait and try again.',
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  const { filePath, data, preset, options = {} } = payload || {};

  if (!filePath) {
    return {
      success: false,
      error: 'File path is required'
    };
  }

  // If preset is provided, use exportPreset
  if (preset) {
    try {
      logger.info(`Exporting preset '${preset}' to: ${filePath}`);
      const result = await importExportManager.exportPreset(filePath, preset, options);
      return result;
    } catch (error) {
      logger.error(`Export preset '${preset}' failed:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Otherwise perform standard export
  if (data === undefined) {
    return {
      success: false,
      error: 'Data is required (or specify a preset)'
    };
  }

  try {
    logger.info(`Exporting data to: ${filePath}`);
    const result = await importExportManager.export(filePath, data, options);
    return result;
  } catch (error) {
    logger.error('Export failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle list formats request
 */
export async function handleListFormats() {
  try {
    const formats = importExportManager.listFormats();
    return {
      success: true,
      formats
    };
  } catch (error) {
    logger.error('List formats failed:', error);
    return {
      success: false,
      error: error.message,
      formats: []
    };
  }
}

/**
 * Handle connectivity status request
 */
export async function handleConnectivityStatus() {
  try {
    const status = connectivityManager.getStatus();
    return {
      success: true,
      ...status
    };
  } catch (error) {
    logger.error('Get connectivity status failed:', error);
    return {
      success: false,
      error: error.message,
      online: false
    };
  }
}


/**
 * Handle validate backup request
 */
export async function handleValidateBackup(event, payload) {
  const { filename } = payload || {};
  if (!filename) return { success: false, error: 'Filename required' };

  try {
    const result = await backupManager.validateBackup(filename);
    return {
      success: true,
      isValid: result.isValid,
      error: result.error
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Handle sync queue add request
 */
export async function handleSyncQueueAdd(event, payload) {
  const { operation } = payload || {};

  if (!operation) {
    return {
      success: false,
      error: 'Operation is required'
    };
  }

  try {
    const result = await syncQueue.enqueue(operation);
    return result;
  } catch (error) {
    logger.error('Sync queue add failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle sync queue process request
 */
export async function handleSyncQueueProcess() {
  try {
    const result = await syncQueue.process();
    return result;
  } catch (error) {
    logger.error('Sync queue process failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle sync queue status request
 */
export async function handleSyncQueueStatus() {
  try {
    const status = syncQueue.getStatus();
    return {
      success: true,
      ...status
    };
  } catch (error) {
    logger.error('Sync queue status failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export handlers registry
export const dataHandlers = {
  [IPC_CHANNELS.DATA_CREATE_BACKUP]: handleCreateBackup,
  [IPC_CHANNELS.DATA_LIST_BACKUPS]: handleListBackups,
  [IPC_CHANNELS.DATA_RESTORE_BACKUP]: handleRestoreBackup,
  [IPC_CHANNELS.DATA_DELETE_BACKUP]: handleDeleteBackup,
  'data:validate-backup': handleValidateBackup,
  [IPC_CHANNELS.DATA_IMPORT]: handleDataImport,
  [IPC_CHANNELS.DATA_EXPORT]: handleDataExport,
  [IPC_CHANNELS.DATA_LIST_FORMATS]: handleListFormats,
  [IPC_CHANNELS.CONNECTIVITY_STATUS]: handleConnectivityStatus,
  [IPC_CHANNELS.SYNC_QUEUE_ADD]: handleSyncQueueAdd,
  [IPC_CHANNELS.SYNC_QUEUE_PROCESS]: handleSyncQueueProcess,
  [IPC_CHANNELS.SYNC_QUEUE_STATUS]: handleSyncQueueStatus
};

export default dataHandlers;
