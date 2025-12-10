import React from 'react';
import IPCDemo from '../components/demo/IPCDemo';

/**
 * IPCDemoPage
 * Page wrapper for IPC communication demonstration
 */
export default function IPCDemoPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">IPC Communication Demo</h1>
        <p className="text-muted-foreground">
          Explore all available IPC APIs and their usage patterns
        </p>
      </div>

      <IPCDemo />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">IPC Architecture</h2>
        <p className="text-sm text-muted-foreground mb-4">
          All communication between renderer and main process follows these security principles:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>All APIs exposed through window.electronAPI</li>
          <li>Input validation on both renderer and main process</li>
          <li>Error handling with sanitized error messages</li>
          <li>No direct Node.js access in renderer process</li>
          <li>Context isolation enabled for security</li>
        </ul>

        <h3 className="text-md font-semibold mt-4 mb-2">Security Best Practices</h3>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>Never expose entire modules or arbitrary code execution</li>
          <li>Always validate and sanitize inputs</li>
          <li>Use explicit allow-lists for file paths and operations</li>
          <li>Implement proper error handling</li>
          <li>Log all security-relevant operations</li>
        </ul>
      </div>
    </div>
  );
}
