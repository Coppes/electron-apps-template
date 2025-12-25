import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
/**
 * FileConflictDialog Component
 * Modal dialog for resolving file conflicts with diff view
 */
export default function FileConflictDialog({ isOpen, conflict, onResolve, onClose }) {
    const { t } = useTranslation('data_management');
    const [selectedResolution, setSelectedResolution] = useState('keep-local');
    const [showDiff, setShowDiff] = useState(false);
    if (!isOpen || !conflict)
        return null;
    const handleResolve = () => {
        onResolve(selectedResolution);
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [_jsx("div", { className: "fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75", onClick: onClose }), _jsxs("div", { className: "inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full", children: [_jsx("div", { className: "bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-200 dark:border-red-800", children: _jsxs("div", { className: "flex items-center", children: [_jsx("svg", { className: "h-6 w-6 text-red-600 dark:text-red-400 mr-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }), _jsx("h3", { className: "text-lg font-medium text-red-900 dark:text-red-100", children: t('conflict.title') })] }) }), _jsxs("div", { className: "px-6 py-4", children: [_jsx("div", { className: "mb-6", children: _jsx("p", { className: "text-sm text-gray-700 dark:text-gray-300 mb-2", children: _jsx(Trans, { i18nKey: "conflict.message", t: t, values: { filename: conflict.filename }, components: { 1: _jsx("span", { className: "font-mono font-medium" }) } }) }) }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsx(ResolutionOption, { id: "keep-local", title: t('conflict.keep_local'), description: t('conflict.keep_local_desc'), icon: "\u2B05\uFE0F", selected: selectedResolution === 'keep-local', onSelect: () => setSelectedResolution('keep-local'), metadata: conflict.local, t: t }), _jsx(ResolutionOption, { id: "keep-remote", title: t('conflict.keep_remote'), description: t('conflict.keep_remote_desc'), icon: "\u27A1\uFE0F", selected: selectedResolution === 'keep-remote', onSelect: () => setSelectedResolution('keep-remote'), metadata: conflict.remote, t: t }), _jsx(ResolutionOption, { id: "merge", title: t('conflict.merge'), description: t('conflict.merge_desc'), icon: "\uD83D\uDD00", selected: selectedResolution === 'merge', onSelect: () => setSelectedResolution('merge'), metadata: { warning: 'May require manual review after merge' }, t: t }), _jsx(ResolutionOption, { id: "rename", title: t('conflict.rename'), description: t('conflict.rename_desc'), icon: "\uD83D\uDCCB", selected: selectedResolution === 'rename', onSelect: () => setSelectedResolution('rename'), metadata: { note: 'Remote file will be saved with a timestamp suffix' }, t: t })] }), _jsx("div", { className: "mb-4", children: _jsx("button", { onClick: () => setShowDiff(!showDiff), className: "text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium", children: showDiff ? `▼ ${t('conflict.hide_diff')}` : `▶ ${t('conflict.show_diff')}` }) }), showDiff && (_jsx("div", { className: "mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden", children: _jsxs("div", { className: "grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700", children: [_jsxs("div", { className: "bg-red-50 dark:bg-red-900/10", children: [_jsxs("div", { className: "px-4 py-2 bg-red-100 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800", children: [_jsx("p", { className: "text-xs font-medium text-red-900 dark:text-red-100", children: t('conflict.local_version') }), _jsx("p", { className: "text-xs text-red-700 dark:text-red-300", children: t('conflict.modified', { date: formatDate(conflict.local.modifiedAt) }) })] }), _jsx("div", { className: "p-4", children: _jsx("pre", { className: "text-xs text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-words", children: conflict.local.preview || 'No preview available' }) })] }), _jsxs("div", { className: "bg-green-50 dark:bg-green-900/10", children: [_jsxs("div", { className: "px-4 py-2 bg-green-100 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800", children: [_jsx("p", { className: "text-xs font-medium text-green-900 dark:text-green-100", children: t('conflict.remote_version') }), _jsx("p", { className: "text-xs text-green-700 dark:text-green-300", children: t('conflict.modified', { date: formatDate(conflict.remote.modifiedAt) }) })] }), _jsx("div", { className: "p-4", children: _jsx("pre", { className: "text-xs text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-words", children: conflict.remote.preview || 'No preview available' }) })] })] }) })), _jsx("div", { className: "p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg", children: _jsxs("p", { className: "text-xs text-yellow-800 dark:text-yellow-200", children: ["\u26A0\uFE0F ", t('conflict.warning')] }) })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors", children: t('conflict.cancel') }), _jsx("button", { onClick: handleResolve, className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: t('conflict.resolve') })] })] })] }) }));
}
/**
 * ResolutionOption Component
 * Radio button option for conflict resolution
 */
function ResolutionOption({ id, title, description, icon, selected, onSelect, metadata, t }) {
    return (_jsx("label", { htmlFor: id, className: `block p-4 border-2 rounded-lg cursor-pointer transition-all ${selected
            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`, children: _jsxs("div", { className: "flex items-start", children: [_jsx("input", { type: "radio", id: id, name: "resolution", checked: selected, onChange: onSelect, className: "mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500" }), _jsxs("div", { className: "ml-3 flex-1", children: [_jsxs("div", { className: "flex items-center mb-1", children: [_jsx("span", { className: "text-lg mr-2", children: icon }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: title })] }), _jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400", children: description }), metadata && (_jsxs("div", { className: "mt-2 text-xs text-gray-500 dark:text-gray-500", children: [metadata.modifiedAt && _jsx("p", { children: t('conflict.modified', { date: formatDate(metadata.modifiedAt) }) }), metadata.size && _jsxs("p", { children: ["Size: ", formatFileSize(metadata.size)] }), metadata.warning && (_jsxs("p", { className: "text-yellow-700 dark:text-yellow-400", children: ["\u26A0\uFE0F ", metadata.warning] })), metadata.note && (_jsxs("p", { className: "text-blue-700 dark:text-blue-400", children: ["\u2139\uFE0F ", metadata.note] }))] }))] })] }) }));
}
function formatDate(timestamp) {
    if (!timestamp)
        return 'Unknown';
    return new Date(timestamp).toLocaleString();
}
function formatFileSize(bytes) {
    if (!bytes)
        return 'Unknown';
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
FileConflictDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    conflict: PropTypes.shape({
        filename: PropTypes.string.isRequired,
        local: PropTypes.shape({
            modifiedAt: PropTypes.number,
            size: PropTypes.number,
            preview: PropTypes.string,
        }),
        remote: PropTypes.shape({
            modifiedAt: PropTypes.number,
            size: PropTypes.number,
            preview: PropTypes.string,
        }),
    }),
    onResolve: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};
ResolutionOption.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    metadata: PropTypes.object,
    t: PropTypes.func.isRequired,
};
