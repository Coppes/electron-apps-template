import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, PaperPlaneRight, Trash, WarningCircle, ShieldCheck, ShieldWarning } from '@phosphor-icons/react';
/**
 * NotificationsDemo Component
 * Demonstrates native OS notifications with actions
 */
export default function NotificationsDemo() {
    const { t } = useTranslation('common');
    const [title, setTitle] = useState('Hello!');
    const [body, setBody] = useState('This is a notification from your Electron app');
    const [urgency, setUrgency] = useState('normal');
    const [silent, setSilent] = useState(false);
    const [withActions, setWithActions] = useState(false);
    const [status, setStatus] = useState('');
    const [permissionStatus, setPermissionStatus] = useState(null);
    const [eventLog, setEventLog] = useState([]);
    const addLog = (type, message) => {
        const timestamp = new Date().toLocaleTimeString();
        setEventLog(prev => [
            { type, message, timestamp },
            ...prev.slice(0, 9) // Keep last 10
        ]);
    };
    useEffect(() => {
        // Listen for notification events
        const unsubscribeClick = window.electronAPI.notifications.onClick((data) => {
            addLog('click', `Notification clicked: ${data.title}`);
        });
        const unsubscribeAction = window.electronAPI.notifications.onAction((data) => {
            addLog('action', `Action clicked: ${data.action} on "${data.title}"`);
        });
        const unsubscribeClose = window.electronAPI.notifications.onClose((data) => {
            addLog('close', `Notification closed: ${data.title}`);
        });
        return () => {
            if (unsubscribeClick)
                unsubscribeClick();
            if (unsubscribeAction)
                unsubscribeAction();
            if (unsubscribeClose)
                unsubscribeClose();
        };
    }, []);
    const requestPermission = async () => {
        try {
            const granted = await window.electronAPI.notifications.requestPermission();
            setPermissionStatus(granted ? 'granted' : 'denied');
            addLog('permission', `Permission requested: ${granted ? 'Granted' : 'Denied'}`);
        }
        catch (error) {
            setStatus(`Error requesting permission: ${error.message}`);
        }
    };
    useEffect(() => {
        const check = async () => {
            try {
                const allowed = await window.electronAPI.notifications.checkPermission();
                setPermissionStatus(allowed ? 'granted' : 'denied');
                addLog('permission', `Permission status: ${allowed ? 'Granted' : 'Denied'}`);
            }
            catch (error) {
                setStatus(`Error checking permission: ${error.message}`);
            }
        };
        check();
    }, []);
    const showNotification = async () => {
        if (!title.trim()) {
            setStatus('Please enter a title');
            return;
        }
        try {
            const options = {
                title: title.trim(),
                body: body.trim(),
                urgency,
                silent
            };
            if (withActions) {
                options.actions = [
                    { type: 'button', text: 'Open' },
                    { type: 'button', text: 'Dismiss' }
                ];
            }
            await window.electronAPI.notifications.show(options);
            setStatus(`Notification sent: ${title}`);
            addLog('sent', `Sent notification: ${title}`);
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };
    const showQuickNotification = async (preset) => {
        const presets = {
            success: {
                title: '✓ Success',
                body: 'Operation completed successfully!',
                urgency: 'low',
                silent: false
            },
            warning: {
                title: '⚠ Warning',
                body: 'Please review this action',
                urgency: 'normal',
                silent: false
            },
            error: {
                title: '✗ Error',
                body: 'Something went wrong',
                urgency: 'critical',
                silent: false
            },
            info: {
                title: 'ℹ Information',
                body: 'Here is some useful information',
                urgency: 'normal',
                silent: true
            }
        };
        try {
            await window.electronAPI.notifications.show(presets[preset]);
            addLog('sent', `Sent ${preset} notification`);
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };
    const clearLog = () => {
        setEventLog([]);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Bell, { className: "w-6 h-6 text-orange-600" }), _jsx("h2", { className: "text-2xl font-bold", children: t('notifications_demo.title') })] }), status && (_jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2", children: [_jsx(WarningCircle, { className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-sm text-blue-800", children: status })] })), _jsx("div", { className: "border border-gray-200 rounded-lg p-4 bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h3", { className: "font-semibold", children: t('notifications_demo.permission_status') }), _jsxs("span", { className: `px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${permissionStatus === 'granted'
                                        ? 'bg-green-100 text-green-800'
                                        : permissionStatus === 'denied'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'}`, children: [permissionStatus === 'granted' ? _jsx(ShieldCheck, { className: "w-3 h-3" }) : _jsx(ShieldWarning, { className: "w-3 h-3" }), permissionStatus === null ? t('notifications_demo.unknown') : permissionStatus === 'granted' ? t('notifications_demo.granted') : t('notifications_demo.denied')] })] }), _jsx("button", { onClick: requestPermission, className: "px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50", children: t('notifications_demo.check_request') })] }) }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3", children: t('notifications_demo.quick_title') }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { onClick: () => showQuickNotification('success'), className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2", children: ["\u2713 ", t('notifications_demo.success')] }), _jsxs("button", { onClick: () => showQuickNotification('warning'), className: "px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center justify-center gap-2", children: ["\u26A0 ", t('notifications_demo.warning')] }), _jsxs("button", { onClick: () => showQuickNotification('error'), className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2", children: ["\u2717 ", t('notifications_demo.error')] }), _jsxs("button", { onClick: () => showQuickNotification('info'), className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2", children: ["\u2139 ", t('notifications_demo.info')] })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3", children: t('notifications_demo.custom_title') }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: t('notifications_demo.input_title') }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: t('notifications_demo.input_title_placeholder'), className: "w-full px-3 py-2 border border-gray-300 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: t('notifications_demo.input_body') }), _jsx("textarea", { value: body, onChange: (e) => setBody(e.target.value), placeholder: t('notifications_demo.input_body_placeholder'), rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: t('notifications_demo.urgency') }), _jsxs("select", { value: urgency, onChange: (e) => setUrgency(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded", children: [_jsx("option", { value: "low", children: t('notifications_demo.low') }), _jsx("option", { value: "normal", children: t('notifications_demo.normal') }), _jsx("option", { value: "critical", children: t('notifications_demo.critical') })] })] }), _jsxs("div", { className: "flex items-end gap-4", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: silent, onChange: (e) => setSilent(e.target.checked), className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: t('notifications_demo.silent') })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: withActions, onChange: (e) => setWithActions(e.target.checked), className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: t('notifications_demo.with_actions') })] })] })] }), _jsxs("button", { onClick: showNotification, className: "w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2", children: [_jsx(PaperPlaneRight, { className: "w-4 h-4" }), t('notifications_demo.send_btn')] })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h3", { className: "font-semibold", children: [t('notifications_demo.event_log'), " (", eventLog.length, ")"] }), eventLog.length > 0 && (_jsxs("button", { onClick: clearLog, className: "px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center gap-1", children: [_jsx(Trash, { className: "w-3 h-3" }), t('notifications_demo.clear_log')] }))] }), eventLog.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: t('notifications_demo.no_events') })) : (_jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: eventLog.map((log, index) => (_jsx("div", { className: `p-2 rounded text-sm border ${log.type === 'click' ? 'bg-blue-50 border-blue-200' :
                                log.type === 'action' ? 'bg-green-50 border-green-200' :
                                    log.type === 'close' ? 'bg-gray-50 border-gray-200' :
                                        'bg-purple-50 border-purple-200'}`, children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("span", { className: "font-semibold text-xs uppercase", children: log.type }), _jsx("p", { className: "text-gray-700 mt-1", children: log.message })] }), _jsx("span", { className: "text-xs text-gray-500 ml-2", children: log.timestamp })] }) }, index))) }))] }), _jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: t('notifications_demo.instructions_title') }), _jsxs("ol", { className: "list-decimal list-inside space-y-1 text-sm", children: [_jsx("li", { children: t('notifications_demo.instruction_1') }), _jsx("li", { children: t('notifications_demo.instruction_2') }), _jsx("li", { children: t('notifications_demo.instruction_3') }), _jsx("li", { children: t('notifications_demo.instruction_4') }), _jsx("li", { children: t('notifications_demo.instruction_5') }), _jsx("li", { children: t('notifications_demo.instruction_6') })] }), _jsx("div", { className: "mt-3 pt-3 border-t border-yellow-300", children: _jsxs("p", { className: "text-xs text-gray-700", children: [_jsx("strong", { children: t('notifications_demo.platform_support') }), _jsx("br", {}), "\u2022 ", _jsx("strong", { children: t('notifications_demo.macos_support') }), _jsx("br", {}), "\u2022 ", _jsx("strong", { children: t('notifications_demo.windows_support') }), _jsx("br", {}), "\u2022 ", _jsx("strong", { children: t('notifications_demo.linux_support') })] }) })] })] }));
}
