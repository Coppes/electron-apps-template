import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
/**
 * SyncQueueViewer Component
 * View and manage sync queue operations
 */
export default function SyncQueueViewer() {
    const { t } = useTranslation('data_management');
    const [operations, setOperations] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const loadQueueData = useCallback(async () => {
        try {
            setError(null);
            const [queueStatus, queueOperations] = await Promise.all([
                window.electronAPI.data.getSyncQueueStatus(),
                window.electronAPI.data.getSyncQueueOperations(),
            ]);
            setStatus(queueStatus);
            setOperations(queueOperations);
        }
        catch (err) {
            setError(t('sync_queue.error_load', { error: err.message }));
        }
        finally {
            setLoading(false);
        }
    }, [t]);
    useEffect(() => {
        loadQueueData();
        const interval = setInterval(loadQueueData, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, [loadQueueData]);
    const handleProcessQueue = async () => {
        try {
            setError(null);
            await window.electronAPI.data.processSyncQueue();
            await loadQueueData();
        }
        catch (err) {
            setError(t('sync_queue.error_process', { error: err.message }));
        }
    };
    const handleRetryOperation = async (operationId) => {
        try {
            setError(null);
            await window.electronAPI.data.retrySyncOperation({ operationId });
            await loadQueueData();
        }
        catch (err) {
            setError(t('sync_queue.error_retry', { error: err.message }));
        }
    };
    const filteredOperations = operations.filter((op) => {
        if (filter === 'all')
            return true;
        return op.status === filter;
    });
    const getStatusCounts = () => {
        return operations.reduce((acc, op) => {
            acc[op.status] = (acc[op.status] || 0) + 1;
            return acc;
        }, { pending: 0, syncing: 0, synced: 0, failed: 0 });
    };
    const statusCounts = getStatusCounts();
    if (loading) {
        return (_jsxs("div", { className: "p-6 text-center", children: [_jsx("div", { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: t('sync_queue.loading') })] }));
    }
    return (_jsxs("div", { className: "p-6 max-w-6xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-2", children: t('sync_queue.title') }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: t('sync_queue.subtitle') })] }), status && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx(StatusCard, { title: t('sync_queue.total'), value: status.totalOperations, icon: "\uD83D\uDCCA", color: "blue" }), _jsx(StatusCard, { title: t('sync_queue.pending'), value: statusCounts.pending, icon: "\u23F3", color: "yellow", onClick: () => setFilter('pending') }), _jsx(StatusCard, { title: t('sync_queue.synced'), value: statusCounts.synced, icon: "\u2705", color: "green", onClick: () => setFilter('synced') }), _jsx(StatusCard, { title: t('sync_queue.failed'), value: statusCounts.failed, icon: "\u274C", color: "red", onClick: () => setFilter('failed') })] })), _jsxs("div", { className: "mb-6 flex gap-3", children: [_jsx("button", { onClick: handleProcessQueue, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: t('sync_queue.process_now') }), _jsx("button", { onClick: loadQueueData, className: "px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors", children: t('sync_queue.refresh') }), _jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: t('sync_queue.filter_all') }), _jsx("option", { value: "pending", children: t('sync_queue.pending') }), _jsx("option", { value: "syncing", children: t('sync_queue.syncing') }), _jsx("option", { value: "synced", children: t('sync_queue.synced') }), _jsx("option", { value: "failed", children: t('sync_queue.failed') })] })] }), error && (_jsx("div", { className: "mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: _jsx("p", { className: "text-red-800 dark:text-red-200", children: error }) })), filteredOperations.length === 0 ? (_jsxs("div", { className: "text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }), _jsx("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: t('sync_queue.no_operations') })] })) : (_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t('sync_queue.table.operation') }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t('sync_queue.table.type') }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t('sync_queue.table.status') }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t('sync_queue.table.retries') }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t('sync_queue.table.timestamp') }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: t('sync_queue.table.actions') })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: filteredOperations.map((operation) => (_jsx(OperationRow, { operation: operation, onRetry: handleRetryOperation, t: t }, operation.id))) })] }) }) }))] }));
}
/**
 * StatusCard Component
 * Display sync queue status metrics
 */
function StatusCard({ title, value, icon, color, onClick }) {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    };
    return (_jsx("div", { onClick: onClick, className: `p-4 border rounded-lg ${colorClasses[color]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium opacity-75", children: title }), _jsx("p", { className: "text-2xl font-bold mt-1", children: value })] }), _jsx("span", { className: "text-3xl", children: icon })] }) }));
}
/**
 * OperationRow Component
 * Single operation in the sync queue table
 */
function OperationRow({ operation, onRetry, t }) {
    const statusColors = {
        pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
        syncing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
        synced: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
        failed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    };
    return (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", children: [_jsxs("td", { className: "px-6 py-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-900 dark:text-white", children: operation.entity || 'Unknown' }), operation.error && (_jsx("div", { className: "text-xs text-red-600 dark:text-red-400 mt-1", children: operation.error }))] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400 uppercase", children: operation.type }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[operation.status]}`, children: operation.status }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: [operation.retries, " / 5"] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: new Date(operation.timestamp).toLocaleString() }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: operation.status === 'failed' && operation.retries < 5 && (_jsx("button", { onClick: () => onRetry(operation.id), className: "text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300", children: t('sync_queue.retry') })) })] }));
}
StatusCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    icon: PropTypes.string.isRequired,
    color: PropTypes.oneOf(['blue', 'yellow', 'green', 'red']).isRequired,
    onClick: PropTypes.func,
};
OperationRow.propTypes = {
    operation: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        entity: PropTypes.string,
        status: PropTypes.oneOf(['pending', 'syncing', 'synced', 'failed']).isRequired,
        retries: PropTypes.number.isRequired,
        timestamp: PropTypes.number.isRequired,
        error: PropTypes.string,
    }).isRequired,
    onRetry: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};
