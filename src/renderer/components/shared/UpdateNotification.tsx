import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Alert, AlertTitle, AlertDescription } from '../ui/Alert';
import Button from '../ui/Button';

/**
 * Update notification banner component
 * Displays update availability and download progress to users
 * 
 * @param {Object} props - Component props
 * @param {Object} props.updateInfo - Update information
 * @param {string} props.updateInfo.version - New version number
 * @param {string} [props.updateInfo.releaseNotes] - Release notes/changelog
 * @param {string} props.status - Update status ('available', 'downloading', 'ready')
 * @param {Object} [props.progress] - Download progress
 * @param {number} [props.progress.percent] - Download percentage (0-100)
 * @param {Function} props.onInstall - Handler for install action
 * @param {Function} props.onDismiss - Handler for dismiss action
 */
export function UpdateNotification({ updateInfo, status, progress, onInstall, onDismiss }) {
  const { t } = useTranslation('common');
  if (!updateInfo || !status) {
    return null;
  }

  const renderContent = () => {
    switch (status) {
      case 'available':
        return (
          <>
            <AlertTitle>{t('update.available.title')}</AlertTitle>
            <AlertDescription>
              <p className="mb-3">
                {t('update.available.message', { version: updateInfo.version })}
              </p>
              {updateInfo.releaseNotes && (
                <details className="mb-3 text-xs">
                  <summary className="cursor-pointer hover:underline">{t('update.available.release_notes')}</summary>
                  <div className="mt-2 whitespace-pre-wrap">{updateInfo.releaseNotes}</div>
                </details>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={onInstall}>
                  {t('update.download_btn')}
                </Button>
                <Button size="sm" variant="outline" onClick={onDismiss}>
                  {t('update.later')}
                </Button>
              </div>
            </AlertDescription>
          </>
        );

      case 'downloading':
        return (
          <>
            <AlertTitle>{t('update.download.title')}</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                {t('update.download.message', { version: updateInfo.version })}
              </p>
              {progress && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{progress.percent?.toFixed(0)}%</span>
                    <span>
                      {formatBytes(progress.transferred)} / {formatBytes(progress.total)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percent || 0}%` }}
                    />
                  </div>
                </div>
              )}
              <Button size="sm" variant="outline" onClick={onDismiss}>
                {t('update.download.hide')}
              </Button>
            </AlertDescription>
          </>
        );

      case 'ready':
        return (
          <>
            <AlertTitle>{t('update.ready.title')}</AlertTitle>
            <AlertDescription>
              <p className="mb-3">
                {t('update.ready.message', { version: updateInfo.version })}
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={onInstall}>
                  {t('update.ready.install')}
                </Button>
                <Button size="sm" variant="outline" onClick={onDismiss}>
                  {t('update.later')}
                </Button>
              </div>
            </AlertDescription>
          </>
        );

      default:
        return null;
    }
  };

  const getVariant = () => {
    switch (status) {
      case 'available':
        return 'info';
      case 'downloading':
        return 'info';
      case 'ready':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] animate-in slide-in-from-top-2">
      <Alert variant={getVariant()}>
        {renderContent()}
      </Alert>
    </div>
  );
}

UpdateNotification.propTypes = {
  updateInfo: PropTypes.shape({
    version: PropTypes.string.isRequired,
    releaseNotes: PropTypes.string,
    releaseDate: PropTypes.string,
  }),
  status: PropTypes.oneOf(['available', 'downloading', 'ready']),
  progress: PropTypes.shape({
    percent: PropTypes.number,
    transferred: PropTypes.number,
    total: PropTypes.number,
    bytesPerSecond: PropTypes.number,
  }),
  onInstall: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
