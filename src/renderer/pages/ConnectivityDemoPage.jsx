import React from 'react';
import ConnectivityDemo from '../components/demo/ConnectivityDemo';

/**
 * ConnectivityDemoPage
 * Page wrapper for connectivity and sync queue demonstration
 */
export default function ConnectivityDemoPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Connectivity Demo</h1>
        <p className="text-muted-foreground">
          Monitor network status and explore offline-first sync capabilities
        </p>
      </div>

      <ConnectivityDemo />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Offline-First Features</h2>
        <p className="text-sm text-muted-foreground mb-4">
          The sync queue automatically handles operations when offline and syncs when back online:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>Operations are queued when network is unavailable</li>
          <li>Automatic retry with exponential backoff</li>
          <li>Persistent queue survives app restarts</li>
          <li>Visual feedback for pending operations</li>
        </ul>
      </div>
    </div>
  );
}
