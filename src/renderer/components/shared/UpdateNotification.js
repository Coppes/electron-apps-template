import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
                return (_jsxs(_Fragment, { children: [_jsx(AlertTitle, { children: t('update.available.title') }), _jsxs(AlertDescription, { children: [_jsx("p", { className: "mb-3", children: t('update.available.message', { version: updateInfo.version }) }), updateInfo.releaseNotes && (_jsxs("details", { className: "mb-3 text-xs", children: [_jsx("summary", { className: "cursor-pointer hover:underline", children: t('update.available.release_notes') }), _jsx("div", { className: "mt-2 whitespace-pre-wrap", children: updateInfo.releaseNotes })] })), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", onClick: onInstall, children: t('update.download_btn') }), _jsx(Button, { size: "sm", variant: "outline", onClick: onDismiss, children: t('update.later') })] })] })] }));
            case 'downloading':
                return (_jsxs(_Fragment, { children: [_jsx(AlertTitle, { children: t('update.download.title') }), _jsxs(AlertDescription, { children: [_jsx("p", { className: "mb-2", children: t('update.download.message', { version: updateInfo.version }) }), progress && (_jsxs("div", { className: "mb-3", children: [_jsxs("div", { className: "flex justify-between text-xs mb-1", children: [_jsxs("span", { children: [progress.percent?.toFixed(0), "%"] }), _jsxs("span", { children: [formatBytes(progress.transferred), " / ", formatBytes(progress.total)] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${progress.percent || 0}%` } }) })] })), _jsx(Button, { size: "sm", variant: "outline", onClick: onDismiss, children: t('update.download.hide') })] })] }));
            case 'ready':
                return (_jsxs(_Fragment, { children: [_jsx(AlertTitle, { children: t('update.ready.title') }), _jsxs(AlertDescription, { children: [_jsx("p", { className: "mb-3", children: t('update.ready.message', { version: updateInfo.version }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", onClick: onInstall, children: t('update.ready.install') }), _jsx(Button, { size: "sm", variant: "outline", onClick: onDismiss, children: t('update.later') })] })] })] }));
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
    return (_jsx("div", { className: "fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] animate-in slide-in-from-top-2", children: _jsx(Alert, { variant: getVariant(), children: renderContent() }) }));
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
    if (!bytes || bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
