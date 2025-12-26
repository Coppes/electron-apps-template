import { useState } from 'react';
import { Pulse, Play, Pause, StopCircle, ArrowClockwise } from '@phosphor-icons/react';

/**
 * ProgressDemo Component
 * Demonstrates taskbar/dock progress indicators
 */
export default function ProgressDemo() {
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState('normal');
  const [isSimulating, setIsSimulating] = useState(false);
  const [status, setStatus] = useState('Ready');

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const updateProgress = async (value: number, state: any = 'normal') => {
    try {
      // API expects number and options object. 
      // Ensure we match the expected signature: set(value: number, options?: ProgressOptions)
      const options = { mode: state } as any;
      await window.electronAPI.progress.set(value, options);
      setStatus(`Progress: ${Math.round(value * 100)}% (${state})`);
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  const clearProgress = async () => {
    try {
      await window.electronAPI.progress.clear();
      setProgress(0);
      setIsSimulating(false);
      setStatus('Progress cleared');
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  const resetProgress = async () => {
    try {
      // Use set instead of reset if reset doesn't exist, or cast to any
      await window.electronAPI.progress.set(0, { mode: 'none' } as any);
      setProgress(0);
      setIsSimulating(false);
      setStatus('Progress reset');
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  // No resetProgress logic here matching previous check, assuming cleanup
  const startSimulation = async () => {
    setProgress(0);
    setIsSimulating(true);

    // Simulate progress over time
    for (let i = 0; i <= 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const value = i / 20;
      setProgress(value);
      await updateProgress(value, mode);
    }
    setIsSimulating(false);
  };

  const pauseSimulation = () => {
    setIsSimulating(false);
  };

  // Indeterminate progress (loading)
  const setIndeterminate = async () => {
    // In many environments, -1 or > 1 triggers indeterminate
    // Using updateProgress wrapper which handles options correctly
    await updateProgress(2, 'indeterminate');

    // Or explicit call with correct options
    /*
    try {
      await window.electronAPI.progress.set(-1, { mode: 'indeterminate' } as any);
      setStatus('Indeterminate mode');
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }
    */
  };

  const modes = [
    { value: 'normal', label: 'Normal', color: 'blue' },
    { value: 'indeterminate', label: 'Indeterminate', color: 'purple' },
    { value: 'error', label: 'Error', color: 'red' },
    { value: 'paused', label: 'Paused', color: 'yellow' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Pulse className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold">Progress Indicator</h2>
      </div>

      {/* Status */}
      {status && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">{status}</p>
        </div>
      )}

      {/* Progress Bar Visual */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Current Progress</h3>
        <div className="space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            {progress === -1 ? (
              <div className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-pulse"></div>
            ) : (
              <div
                className={`h-full transition-all duration-200 ${mode === 'error' ? 'bg-red-600' :
                  mode === 'paused' ? 'bg-yellow-500' :
                    'bg-blue-600'
                  }`}
                style={{ width: `${progress * 100}%` }}
              ></div>
            )}
          </div>
          <p className="text-center text-2xl font-bold">
            {progress === -1 ? '∞' : `${Math.round(progress * 100)}%`}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Controls</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={startSimulation}
            disabled={isSimulating}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Simulation
          </button>
          <button
            onClick={pauseSimulation}
            disabled={!isSimulating}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
          <button
            onClick={setIndeterminate}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <ArrowClockwise className="w-4 h-4" />
            Indeterminate
          </button>
          <button
            onClick={clearProgress}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <StopCircle className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Manual Progress Control */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Manual Control</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Progress Value: {Math.round(progress * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(progress * 100)}
              onChange={async (e) => {
                const value = parseFloat(e.target.value) / 100;
                setProgress(value);
                await updateProgress(value, mode);
              }}
              disabled={isSimulating}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[0, 0.25, 0.5, 0.75, 1].map((value) => (
              <button
                key={value}
                onClick={async () => {
                  setProgress(value);
                  await updateProgress(value, mode);
                }}
                disabled={isSimulating}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:bg-gray-50"
              >
                {Math.round(value * 100)}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Mode */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Progress Mode</h3>
        <div className="grid grid-cols-2 gap-3">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-4 py-2 rounded border-2 transition-all ${mode === m.value
                ? `border-${m.color}-600 bg-${m.color}-50`
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <span className={`font-medium ${mode === m.value ? `text-${m.color}-700` : 'text-gray-700'}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Note: Windows shows different colors for different modes. macOS and Linux may not show visual differences.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Look at your taskbar (Windows) or dock (macOS) icon</li>
          <li>Click &ldquo;Start Simulation&rdquo; to see progress animate automatically</li>
          <li>Try different modes to see visual changes (Windows shows colors)</li>
          <li>Use manual slider to set specific progress values</li>
          <li>Click &ldquo;Indeterminate&rdquo; for spinning/bouncing progress</li>
          <li>Click &ldquo;Clear&rdquo; to remove the progress indicator</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-yellow-300">
          <p className="text-xs text-gray-700">
            <strong>Platform Differences:</strong><br />
            • <strong>Windows:</strong> Shows colored progress bar on taskbar button (blue/green/yellow/red)<br />
            • <strong>macOS:</strong> Shows progress bar on dock icon (bouncing for indeterminate)<br />
            • <strong>Linux:</strong> Support varies by desktop environment (Unity shows on launcher)
          </p>
        </div>
      </div>
    </div>
  );
}
