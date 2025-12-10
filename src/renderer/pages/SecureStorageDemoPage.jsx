import React from 'react';
import SecureStorageDemo from '../components/features/secure-storage/SecureStorageDemo';

/**
 * SecureStorageDemoPage
 * Page wrapper for secure storage demonstration
 */
export default function SecureStorageDemoPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Secure Storage Demo</h1>
        <p className="text-muted-foreground">
          Explore encrypted storage capabilities and key management
        </p>
      </div>

      <SecureStorageDemo />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Encryption Details</h2>
        <p className="text-sm text-muted-foreground mb-4">
          The secure storage system uses industry-standard encryption:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>AES-256-GCM encryption for data at rest</li>
          <li>PBKDF2 key derivation with configurable iterations</li>
          <li>Unique salt and IV for each encrypted value</li>
          <li>Secure key storage using OS keychain (keytar)</li>
          <li>Protection against timing attacks</li>
        </ul>

        <h3 className="text-md font-semibold mt-4 mb-2">Key Management Best Practices</h3>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>Never store encryption keys in plain text</li>
          <li>Use strong, randomly generated passwords</li>
          <li>Implement key rotation for sensitive data</li>
          <li>Back up encryption keys securely</li>
          <li>Use separate keys for different data types</li>
        </ul>

        <h3 className="text-md font-semibold mt-4 mb-2">Migration Example</h3>
        <pre className="bg-background p-3 rounded text-xs overflow-x-auto mt-2">
{`// Migrate from plain storage to secure storage
const plainValue = await window.electronAPI.storage.get('sensitive-data');
await window.electronAPI.storage.set('sensitive-data', plainValue, {
  encrypted: true,
  keyId: 'app-master-key'
});

// Re-encrypt with new key
await window.electronAPI.storage.rotateKey('sensitive-data', 'new-key-id');`}
        </pre>
      </div>
    </div>
  );
}
