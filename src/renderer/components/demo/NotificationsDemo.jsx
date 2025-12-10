import { useState, useEffect } from 'react';
import { Bell, PaperPlaneRight, Trash, WarningCircle } from '@phosphor-icons/react';

/**
 * NotificationsDemo Component
 * Demonstrates native OS notifications with actions
 */
export default function NotificationsDemo() {
  const [title, setTitle] = useState('Hello!');
  const [body, setBody] = useState('This is a notification from your Electron app');
  const [urgency, setUrgency] = useState('normal');
  const [silent, setSilent] = useState(false);
  const [withActions, setWithActions] = useState(false);
  const [status, setStatus] = useState('');
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
      if (unsubscribeClick) unsubscribeClick();
      if (unsubscribeAction) unsubscribeAction();
      if (unsubscribeClose) unsubscribeClose();
    };
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
    } catch (error) {
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
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const clearLog = () => {
    setEventLog([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold">Native Notifications</h2>
      </div>

      {/* Status */}
      {status && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2">
          <WarningCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">{status}</p>
        </div>
      )}

      {/* Quick Notifications */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Quick Notifications</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => showQuickNotification('success')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
          >
            ✓ Success
          </button>
          <button
            onClick={() => showQuickNotification('warning')}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center justify-center gap-2"
          >
            ⚠ Warning
          </button>
          <button
            onClick={() => showQuickNotification('error')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2"
          >
            ✗ Error
          </button>
          <button
            onClick={() => showQuickNotification('info')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            ℹ Info
          </button>
        </div>
      </div>

      {/* Custom Notification */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Custom Notification</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notification body text"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="critical">Critical</option>
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
                <span className="text-sm">Silent</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={withActions}
                  onChange={(e) => setWithActions(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">With Actions</span>
              </label>
            </div>
          </div>

          <button
            onClick={showNotification}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <PaperPlaneRight className="w-4 h-4" />
            Send Notification
          </button>
        </div>
      </div>

      {/* Event Log */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Event Log ({eventLog.length})</h3>
          {eventLog.length > 0 && (
            <button
              onClick={clearLog}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <Trash className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {eventLog.length === 0 ? (
          <p className="text-gray-500 text-sm">No events yet. Send a notification to see events.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {eventLog.map((log, index) => (
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
        <h4 className="font-semibold mb-2">Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Try the quick notification buttons for common use cases</li>
          <li>Create custom notifications with title, body, and options</li>
          <li>Click on notifications to see click events logged</li>
          <li>Enable &ldquo;With Actions&rdquo; to add buttons (platform support varies)</li>
          <li>Watch the event log for all notification interactions</li>
          <li>Rate limiting prevents more than 10 notifications per minute</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-yellow-300">
          <p className="text-xs text-gray-700">
            <strong>Platform Support:</strong><br />
            • <strong>macOS:</strong> Full support including actions and replies<br />
            • <strong>Windows 10+:</strong> Supports actions via Action Center<br />
            • <strong>Linux:</strong> Support varies by desktop environment (GNOME, KDE, etc.)
          </p>
        </div>
      </div>
    </div>
  );
}
