import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, PaperPlaneRight, Trash, WarningCircle, ShieldCheck, ShieldWarning } from '@phosphor-icons/react';

/**
 * NotificationsDemo Component
 * Demonstrates native OS notifications with actions
 */
export default function NotificationsDemo() {
  const { t } = useTranslation('common');
  const [title, setTitle] = useState('Hello Electron');
  const [body, setBody] = useState('This is a native notification');
  const [urgency, setUrgency] = useState('normal');
  const [silent, setSilent] = useState(false);
  const [withActions, setWithActions] = useState(false);

  const [status, setStatus] = useState('');
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const addLog = (type: string, message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      { type, message, timestamp, data },
      ...prev.slice(0, 9) // Keep last 10
    ]);
  };

  useEffect(() => {
    checkPermission();

    // Listen for notification events
    const unsubscribeClick = window.electronAPI.notifications.onClick((id: string) => {
      addLog('click', `Notification clicked: ${id}`);
    });

    const unsubscribeAction = window.electronAPI.notifications.onAction((id: string, action: string) => {
      addLog('action', `Action clicked: ${action} on "${id}"`);
    });

    const unsubscribeClose = window.electronAPI.notifications.onClose((id: string) => {
      addLog('close', `Notification closed: ${id}`);
    });

    return () => {
      if (unsubscribeClick) unsubscribeClick();
      if (unsubscribeAction) unsubscribeAction();
      if (unsubscribeClose) unsubscribeClose();
    };
  }, []);

  const checkPermission = async () => {
    try {
      const allowed = await window.electronAPI.notifications.checkPermission();
      setPermissionStatus(allowed ? 'granted' : 'denied');
      addLog('permission', `Permission status: ${allowed ? 'Granted' : 'Denied'}`);
    } catch (error) {
      setStatus(`Error checking permission: ${(error as Error).message}`);
    }
  };

  const requestPermission = async () => {
    try {
      const granted = await window.electronAPI.notifications.requestPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      setStatus(granted ? 'Permission granted' : 'Permission denied');
      addLog('permission', `Permission requested: ${granted ? 'Granted' : 'Denied'}`);
    } catch (error) {
      setStatus(`Error requesting permission: ${(error as Error).message}`);
    }
  };

  const showNotification = async () => {
    if (!title.trim()) {
      setStatus('Please enter a title');
      return;
    }

    try {
      const options: any = {
        title: title.trim(),
        body: body.trim(),
        urgency,
        silent
      };

      // Check platform via navigator or just default to adding actions (Electron handles support)
      // window.electronAPI.platform is not available.
      // We can just add actions and if not supported, they might be ignored or we can skip check.
      // For demo purposes, let's assume if actions enabled, we send them.
      if (withActions) {
        options.actions = [
          { type: 'button', text: 'Reply' },
          { type: 'button', text: 'Dismiss' }
        ];
      }

      await window.electronAPI.notifications.show(options);
      setStatus(`Notification sent: ${title}`);
      addLog('sent', `Sent notification: ${title}`);
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  const showQuickNotification = async (preset: string) => {
    const presets: Record<string, any> = {
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

    if (presets[preset]) {
      try {
        await window.electronAPI.notifications.show(presets[preset]);
        setStatus(`Sent ${preset} notification`);
        addLog('sent', `Sent ${preset} notification`);
      } catch (error) {
        setStatus(`Error: ${(error as Error).message}`);
      }
    }
  };

  const clearLog = () => {
    setLogs([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold">{t('notifications_demo.title')}</h2>
      </div>

      {/* Status */}
      {
        status && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2">
            <WarningCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">{status}</p>
          </div>
        )
      }



      {/* Permission Section */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">{t('notifications_demo.permission_status')}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${permissionStatus === 'granted'
              ? 'bg-green-100 text-green-800'
              : permissionStatus === 'denied'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
              }`}>
              {permissionStatus === 'granted' ? <ShieldCheck className="w-3 h-3" /> : <ShieldWarning className="w-3 h-3" />}
              {permissionStatus === null ? t('notifications_demo.unknown') : permissionStatus === 'granted' ? t('notifications_demo.granted') : t('notifications_demo.denied')}
            </span>
          </div>
          <button
            onClick={requestPermission}
            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
          >
            {t('notifications_demo.check_request')}
          </button>
        </div>
      </div>

      {/* Quick Notifications */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">{t('notifications_demo.quick_title')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => showQuickNotification('success')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
          >
            ✓ {t('notifications_demo.success')}
          </button>
          <button
            onClick={() => showQuickNotification('warning')}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center justify-center gap-2"
          >
            ⚠ {t('notifications_demo.warning')}
          </button>
          <button
            onClick={() => showQuickNotification('error')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2"
          >
            ✗ {t('notifications_demo.error')}
          </button>
          <button
            onClick={() => showQuickNotification('info')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            ℹ {t('notifications_demo.info')}
          </button>
        </div>
      </div>

      {/* Custom Notification */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">{t('notifications_demo.custom_title')}</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t('notifications_demo.input_title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('notifications_demo.input_title_placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('notifications_demo.input_body')}</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('notifications_demo.input_body_placeholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t('notifications_demo.urgency')}</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="low">{t('notifications_demo.low')}</option>
                <option value="normal">{t('notifications_demo.normal')}</option>
                <option value="critical">{t('notifications_demo.critical')}</option>
              </select>
            </div>

            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={silent}
                  onChange={(e) => setSilent(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{t('notifications_demo.silent')}</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={withActions}
                  onChange={(e) => setWithActions(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{t('notifications_demo.with_actions')}</span>
              </label>
            </div>
          </div>

          <button
            onClick={showNotification}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <PaperPlaneRight className="w-4 h-4" />
            {t('notifications_demo.send_btn')}
          </button>
        </div>
      </div>

      {/* Event Log */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{t('notifications_demo.event_log')} ({logs.length})</h3>
          {logs.length > 0 && (
            <button
              onClick={clearLog}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <Trash className="w-3 h-3" />
              {t('notifications_demo.clear_log')}
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">{t('notifications_demo.no_events')}</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm border ${log.type === 'click' ? 'bg-blue-50 border-blue-200' :
                  log.type === 'action' ? 'bg-green-50 border-green-200' :
                    log.type === 'close' ? 'bg-gray-50 border-gray-200' :
                      'bg-purple-50 border-purple-200'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="font-semibold text-xs uppercase">{log.type}</span>
                    <p className="text-gray-700 mt-1">{log.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2">{t('notifications_demo.instructions_title')}</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>{t('notifications_demo.instruction_1')}</li>
          <li>{t('notifications_demo.instruction_2')}</li>
          <li>{t('notifications_demo.instruction_3')}</li>
          <li>{t('notifications_demo.instruction_4')}</li>
          <li>{t('notifications_demo.instruction_5')}</li>
          <li>{t('notifications_demo.instruction_6')}</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-yellow-300">
          <p className="text-xs text-gray-700">
            <strong>{t('notifications_demo.platform_support')}</strong><br />
            • <strong>{t('notifications_demo.macos_support')}</strong><br />
            • <strong>{t('notifications_demo.windows_support')}</strong><br />
            • <strong>{t('notifications_demo.linux_support')}</strong>
          </p>
        </div>
      </div>

    </div >

  );
}
