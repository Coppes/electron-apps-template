import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import PropTypes from 'prop-types';
/**
 * ImportExportDialog Component
 * Modal dialog for importing and exporting data with format selection
 */
export default function ImportExportDialog({ isOpen, mode, onClose }) {
    const [selectedFormat, setSelectedFormat] = useState('json');
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const handleImport = async () => {
        try {
            setProcessing(true);
            setError(null);
            setResult(null);
            setProgress({ current: 0, total: 100, message: 'Selecting file...' });
            // Let user pick file
            const filePath = await window.electronAPI.dialog.showOpenDialog({
                title: 'Select file to import',
                filters: getFileFilters(selectedFormat),
                properties: ['openFile'],
            });
            if (!filePath) {
                setProcessing(false);
                return;
            }
            setProgress({ current: 30, total: 100, message: 'Reading file...' });
            const importResult = await window.electronAPI.data.import(filePath, {
                format: selectedFormat,
            });
            setProgress({ current: 100, total: 100, message: 'Complete!' });
            setResult({
                success: true,
                message: `Successfully imported ${importResult.recordCount || 0} records`,
                details: importResult,
            });
            // Auto-close after success
            setTimeout(() => {
                onClose();
            }, 2000);
        }
        catch (err) {
            setError(`Import failed: ${err.message}`);
        }
        finally {
            setProcessing(false);
        }
    };
    const handleExport = async () => {
        try {
            setProcessing(true);
            setError(null);
            setResult(null);
            setProgress({ current: 0, total: 100, message: 'Selecting location...' });
            // Let user pick save location
            const filePath = await window.electronAPI.dialog.showSaveDialog({
                title: 'Export data',
                defaultPath: `export-${Date.now()}.${selectedFormat}`,
                filters: getFileFilters(selectedFormat),
            });
            if (!filePath) {
                setProcessing(false);
                return;
            }
            setProgress({ current: 30, total: 100, message: 'Preparing data...' });
            const exportResult = await window.electronAPI.data.export({
                filePath,
                format: selectedFormat,
            });
            setProgress({ current: 100, total: 100, message: 'Complete!' });
            setResult({
                success: true,
                message: `Successfully exported ${exportResult.recordCount || 0} records`,
                details: exportResult,
            });
            // Auto-close after success
            setTimeout(() => {
                onClose();
            }, 2000);
        }
        catch (err) {
            setError(`Export failed: ${err.message}`);
        }
        finally {
            setProcessing(false);
        }
    };
    const getFileFilters = (format) => {
        const filters = {
            json: [{ name: 'JSON Files', extensions: ['json'] }],
            csv: [{ name: 'CSV Files', extensions: ['csv'] }],
            markdown: [{ name: 'Markdown Files', extensions: ['md', 'markdown'] }],
        };
        return filters[format] || [{ name: 'All Files', extensions: ['*'] }];
    };
    const handleSubmit = () => {
        if (mode === 'import') {
            handleImport();
        }
        else {
            handleExport();
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [_jsx("div", { className: "fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75", onClick: onClose }), _jsxs("div", { className: "inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full", children: [_jsx("div", { className: "bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white", children: mode === 'import' ? 'Import Data' : 'Export Data' }) }), _jsxs("div", { className: "px-6 py-4", children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Format" }), _jsxs("select", { value: selectedFormat, onChange: (e) => setSelectedFormat(e.target.value), disabled: processing, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx("option", { value: "json", children: "JSON" }), _jsx("option", { value: "csv", children: "CSV" }), _jsx("option", { value: "markdown", children: "Markdown" })] })] }), _jsx("div", { className: "mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg", children: _jsx("p", { className: "text-sm text-blue-800 dark:text-blue-200", children: getFormatDescription(selectedFormat) }) }), progress && (_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: progress.message }), _jsxs("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: [progress.current, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${progress.current}%` } }) })] })), error && (_jsx("div", { className: "mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: _jsx("p", { className: "text-sm text-red-800 dark:text-red-200", children: error }) })), result && result.success && (_jsxs("div", { className: "mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-green-800 dark:text-green-200", children: result.message }), result.details && result.details.warnings && result.details.warnings.length > 0 && (_jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-xs text-green-700 dark:text-green-300", children: "Warnings:" }), _jsx("ul", { className: "list-disc list-inside text-xs text-green-700 dark:text-green-300", children: result.details.warnings.map((warning, index) => (_jsx("li", { children: warning }, index))) })] }))] }))] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700", children: [_jsx("button", { onClick: onClose, disabled: processing, className: "px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleSubmit, disabled: processing, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors", children: processing ? 'Processing...' : mode === 'import' ? 'Import' : 'Export' })] })] })] }) }));
}
function getFormatDescription(format) {
    const descriptions = {
        json: 'JSON format preserves data structure and types. Best for complete data backup.',
        csv: 'CSV format is compatible with spreadsheet applications. Data structure may be simplified.',
        markdown: 'Markdown format creates human-readable documentation. Best for reporting and documentation.',
    };
    return descriptions[format] || 'Select a format to see description';
}
ImportExportDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    mode: PropTypes.oneOf(['import', 'export']).isRequired,
    onClose: PropTypes.func.isRequired,
};
