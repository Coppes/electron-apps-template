import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Clock } from '@phosphor-icons/react';

/**
 * BackupPage Component
 * Manages backup creation, restoration, and deletion with list view
 */
export default function BackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [schedule, setSchedule] = useState('never');

  // Load backups and settings on mount
  useEffect(() => {
    loadBackups();
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      if (window.electronAPI?.store) {
        const savedSchedule = await window.electronAPI.store.get('backupSchedule');
        if (savedSchedule) {
          setSchedule(savedSchedule);
        }
      }
    } catch (err) {
      // console.error('Failed to load backup schedule:', err);
    }
  };

  const handleScheduleChange = async (e) => {
    const newSchedule = e.target.value;
    setSchedule(newSchedule);
    try {
      if (window.electronAPI?.store) {
        await window.electronAPI.store.set('backupSchedule', newSchedule);
        // In a real app, this would also notify the main process to reschedule
      }
    } catch (err) {
      setError(`Failed to save schedule: ${err.message}`);
    }
  };

  const loadBackups = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.data.listBackups();
      setBackups(result.backups || []);
    } catch (err) {
      setError(`Failed to load backups: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      setError(null);
      setSuccess(null);

      const result = await window.electronAPI.data.createBackup({
        includeSecureStorage: true,
      });

      setSuccess(`Backup created successfully: ${result.filename}`);
      await loadBackups();
    } catch (err) {
      setError(`Failed to create backup: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async (filename) => {
    if (!confirm(`Restore backup "${filename}"? This will replace current data.`)) {
      return;
    }

    try {
      setRestoring(true);
      setError(null);
      setSuccess(null);

      await window.electronAPI.data.restoreBackup(filename);
      setSuccess(`Backup restored successfully: ${filename}`);

      // Reload app data after restore
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(`Failed to restore backup: ${err.message}`);
    } finally {
      setRestoring(false);
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!confirm(`Delete backup "${filename}"? This cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      await window.electronAPI.data.deleteBackup(filename);
      setSuccess(`Backup deleted: ${filename}`);
      await loadBackups();
    } catch (err) {
      setError(`Failed to delete backup: ${err.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // const formatDate = (timestamp) => {
  //   return new Date(timestamp).toLocaleString();
  // };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Backup Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, restore, and manage your application backups
          </p>
        </div>

        {/* Schedule Settings */}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Clock className="w-5 h-5 text-gray-500" />
          <div className="flex flex-col">
            <label htmlFor="schedule" className="text-xs font-medium text-gray-500 uppercase">Auto-Backup</label>
            <select
              id="schedule"
              value={schedule}
              onChange={handleScheduleChange}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-gray-900 dark:text-white"
            >
              <option value="never">Never</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={handleCreateBackup}
          disabled={creating || restoring}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? 'Creating...' : 'Create Backup'}
        </button>
        <button
          onClick={loadBackups}
          disabled={loading || creating || restoring}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Backup List */}
      {loading && backups.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading backups...</p>
        </div>
      ) : backups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-400">No backups found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Create your first backup to get started</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Filename
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {backups.map((backup) => (
                <BackupRow
                  key={backup.filename}
                  backup={backup}
                  onRestore={handleRestoreBackup}
                  onDelete={handleDeleteBackup}
                  disabled={creating || restoring}
                  // formatDate={formatDate}
                  formatFileSize={formatFileSize}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * BackupRow Component
 * Single row in the backup list table
 */
function BackupRow({ backup, onRestore, onDelete, disabled, formatFileSize }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {backup.filename}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(backup.timestamp).toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatFileSize(backup.size)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
          {backup.includeSecureStorage ? 'Full' : 'Standard'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onRestore(backup.filename)}
          disabled={disabled}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed mr-4"
        >
          Restore
        </button>
        <button
          onClick={() => onDelete(backup.filename)}
          disabled={disabled}
          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

BackupRow.propTypes = {
  backup: PropTypes.shape({
    filename: PropTypes.string.isRequired,
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    size: PropTypes.number.isRequired,
    includeSecureStorage: PropTypes.bool,
  }).isRequired,
  onRestore: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  formatFileSize: PropTypes.func.isRequired,
  // formatDate: PropTypes.func.isRequired,
};
