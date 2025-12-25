import { useState } from 'react';
import { useDock } from '../../hooks/useDock';
import { usePowerMonitor } from '../../hooks/usePowerMonitor';
import { Lightning, AppWindow } from '@phosphor-icons/react';

export default function DockPowerDemo() {
  const { setBadge } = useDock();
  const { status: powerStatus, lastEventTime } = usePowerMonitor();

  const [badgeText, setBadgeText] = useState('');

  const handleSetBadge = async () => {
    await setBadge(badgeText);
  };

  const handleClearBadge = async () => {
    setBadgeText('');
    await setBadge('');
  };

  return (
    <div className="space-y-6">
      {/* Dock / Taskbar Section */}
      <div className="flex items-center gap-2 mb-4">
        <AppWindow className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dock & Taskbar</h2>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">App Badge</h3>
        <p className="text-sm text-gray-600 mb-4">
          Set a text badge on the application dock icon (macOS) or taskbar (Windows overlays).
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={badgeText}
            onChange={(e) => setBadgeText(e.target.value)}
            placeholder="Badge text (e.g. 1, ●)"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSetBadge}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Set Badge
          </button>
          <button
            onClick={handleClearBadge}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Power Monitor Section */}
      <div className="flex items-center gap-2 mb-4 mt-8">
        <Lightning className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Power Monitor</h2>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Current Status</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 capitalize">
              {powerStatus === 'unknown' ? 'Waiting for change...' : powerStatus}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Last Event</p>
            <p className="text-lg text-gray-900 dark:text-white mt-1">
              {lastEventTime ? lastEventTime.toLocaleTimeString() : 'None'}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600">
            Try unplugging power cable, or putting system to sleep/suspend to see updates.
          </p>
        </div>
      </div>
    </div>
  );
}
