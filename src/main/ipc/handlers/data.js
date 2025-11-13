/**
 * Data Management IPC Handlers
 * Handles backup/restore and import/export operations
 */

import { IPC_CHANNELS } from '../../../common/constants.js';
import backupManager from '../../data/backup-manager.js';
import importExportManager from '../../data/import-export.js';
import { logger } from '../../logger.js';

/**
 * Handle create backup request
 */
export async function handleCreateBackup(event, payload) {
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
  const { filePath, data, options = {} } = payload || {};

  if (!filePath) {
    return {
      success: false,
      error: 'File path is required'
    };
  }

  if (data === undefined) {
    return {
      success: false,
      error: 'Data is required'
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

// Export handlers registry
export const dataHandlers = {
  [IPC_CHANNELS.DATA_CREATE_BACKUP]: handleCreateBackup,
  [IPC_CHANNELS.DATA_LIST_BACKUPS]: handleListBackups,
  [IPC_CHANNELS.DATA_RESTORE_BACKUP]: handleRestoreBackup,
  [IPC_CHANNELS.DATA_DELETE_BACKUP]: handleDeleteBackup,
  [IPC_CHANNELS.DATA_IMPORT]: handleDataImport,
  [IPC_CHANNELS.DATA_EXPORT]: handleDataExport,
  [IPC_CHANNELS.DATA_LIST_FORMATS]: handleListFormats
};

export default dataHandlers;
