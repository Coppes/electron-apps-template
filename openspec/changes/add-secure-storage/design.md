# Design: Encrypted Storage

## Overview

This design describes the implementation of encrypted storage for sensitive data using Electron's `safeStorage` API. The solution provides OS-level encryption for secrets while maintaining a simple, consistent API for developers.

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│ Renderer Process                                        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Application Code                                 │  │
│  │  - secureStore.set('apiKey', 'secret123')       │  │
│  │  - const key = await secureStore.get('apiKey')  │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                │
│                        ▼                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Preload Script (contextBridge)                   │  │
│  │  - secureStoreAPI exposed to renderer            │  │
│  │  - IPC calls to main process                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ IPC (contextBridge)
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Main Process                                            │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ IPC Handler (secure-store.js)                    │  │
│  │  - SECURE_STORE_SET                              │  │
│  │  - SECURE_STORE_GET                              │  │
│  │  - SECURE_STORE_DELETE                           │  │
│  │  - SECURE_STORE_HAS                              │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                │
│                        ▼                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Encrypted Storage Module                         │  │
│  │  - encryptAndStore(key, value)                   │  │
│  │  - retrieveAndDecrypt(key)                       │  │
│  │  - isEncryptionAvailable()                       │  │
│  │  - deleteEncrypted(key)                          │  │
│  └──────────────────────────────────────────────────┘  │
│            │                           │                │
│            ▼                           ▼                │
│  ┌──────────────────┐      ┌──────────────────────┐   │
│  │ safeStorage API  │      │ electron-store       │   │
│  │ (Electron)       │      │ (Persistence)        │   │
│  │ - encrypt()      │      │ - store encrypted    │   │
│  │ - decrypt()      │      │   buffers            │   │
│  └──────────────────┘      └──────────────────────┘   │
│            │                           │                │
│            ▼                           ▼                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ OS-Level Encryption                              │  │
│  │ - macOS: Keychain                                │  │
│  │ - Windows: DPAPI                                 │  │
│  │ - Linux: libsecret                               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Encrypted Storage Module (`src/main/security/encrypted-storage.js`)

Core module that handles encryption and decryption operations.

**Key Functions:**
- `isEncryptionAvailable()`: Check if OS supports encryption
- `encryptAndStore(key, value)`: Encrypt a value and store it
- `retrieveAndDecrypt(key)`: Retrieve and decrypt a value
- `deleteEncrypted(key)`: Remove an encrypted value
- `hasEncrypted(key)`: Check if encrypted key exists
- `getEncryptionInfo()`: Get encryption availability details

**Implementation Details:**
- Use `safeStorage.isEncryptionAvailable()` to verify support
- Encrypt using `safeStorage.encryptString(plaintext)` returns Buffer
- Store Buffer as base64 in electron-store with prefix `__ENCRYPTED__`
- Decrypt using `safeStorage.decryptString(encrypted)` returns string
- Handle errors gracefully with detailed logging
- Throw descriptive errors when encryption unavailable

**Data Format:**
```javascript
// In electron-store:
{
  "__ENCRYPTED__apiKey": "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=",  // base64 encoded Buffer
  "regularKey": "plaintext value"
}
```

### 2. IPC Handler (`src/main/ipc/handlers/secure-store.js`)

Handles IPC communication for secure storage operations.

**Channels:**
- `SECURE_STORE_SET`: Store encrypted value
- `SECURE_STORE_GET`: Retrieve decrypted value
- `SECURE_STORE_DELETE`: Delete encrypted value
- `SECURE_STORE_HAS`: Check if encrypted key exists

**Validation:**
- Validate key is non-empty string
- Validate value can be serialized (JSON-compatible)
- Return standardized success/error responses
- Log all operations for audit trail

### 3. Preload API (`src/preload.js`)

Exposes secure storage API to renderer via contextBridge.

**API Surface:**
```javascript
secureStoreAPI = {
  set: (key, value) => Promise<{ success: true }>,
  get: (key) => Promise<value | null>,
  delete: (key) => Promise<{ success: true }>,
  has: (key) => Promise<boolean>,
  isAvailable: () => Promise<boolean>,
}
```

### 4. Constants (`src/common/constants.js`)

Add new IPC channels for secure storage.

```javascript
SECURE_STORE_SET: 'secure-store:set',
SECURE_STORE_GET: 'secure-store:get',
SECURE_STORE_DELETE: 'secure-store:delete',
SECURE_STORE_HAS: 'secure-store:has',
SECURE_STORE_IS_AVAILABLE: 'secure-store:is-available',
```

## Security Considerations

### Encryption Availability

**Availability Check:**
```javascript
safeStorage.isEncryptionAvailable()
```

**Platform Support:**
- macOS: Always available (Keychain)
- Windows: Always available (DPAPI)
- Linux: Requires libsecret or gnome-keyring

**Fallback Strategy:**
When encryption is unavailable:
1. Log a warning with encryption unavailability reason
2. Throw an error to prevent storing sensitive data unencrypted
3. Document the limitation in error message
4. Require explicit handling by application code

### Data Protection

**At Rest:**
- Encrypted data stored in electron-store file
- Cannot be decrypted without OS-level credentials
- Encrypted buffers are base64 encoded for storage

**In Transit:**
- Data travels through IPC (already secure via context isolation)
- Decrypted values only exist in memory temporarily
- No plaintext secrets in IPC messages when using secure API

**Access Control:**
- Only main process can decrypt (renderer has no access)
- OS-level authentication required (user login, session lock)
- Encrypted data tied to current user account

### Audit Logging

Log all encryption operations:
- Key being accessed (not the value)
- Operation type (encrypt/decrypt/delete)
- Timestamp and user context
- Success/failure status
- Encryption availability status

### Key Naming Convention

**Prefix for Encrypted Keys:**
Use `__ENCRYPTED__` prefix in electron-store to differentiate encrypted from plaintext keys.

**Benefits:**
- Clear separation of sensitive vs non-sensitive data
- Easy to identify encrypted keys in storage file
- Prevents accidental plaintext reading of encrypted data
- Enables cleanup and migration utilities

## Error Handling

### Encryption Not Available

```javascript
{
  success: false,
  error: 'ENCRYPTION_UNAVAILABLE',
  message: 'Encryption is not available on this system. Please ensure libsecret is installed.',
  details: { platform: 'linux', reason: 'No keychain service found' }
}
```

### Decryption Failure

```javascript
{
  success: false,
  error: 'DECRYPTION_FAILED',
  message: 'Failed to decrypt value. Data may be corrupted.',
  key: 'apiKey'
}
```

### Invalid Input

```javascript
{
  success: false,
  error: 'INVALID_INPUT',
  message: 'Key must be a non-empty string',
  received: typeof key
}
```

## Performance Considerations

### Encryption Overhead

- **Encryption time**: ~1-2ms per operation (negligible)
- **Memory**: Temporary buffers created during encryption/decryption
- **Storage**: Base64 encoding increases size by ~33%

### Optimization Strategies

1. **Lazy Encryption Check**: Cache `isEncryptionAvailable()` result
2. **Batch Operations**: Consider batch API for multiple set/get operations
3. **Async Operations**: All operations are async to prevent blocking
4. **Error Recovery**: Graceful degradation with clear error messages

## Testing Strategy

### Unit Tests

- Test encryption/decryption round-trip
- Test encryption availability detection
- Test error handling (unavailable encryption, corrupt data)
- Test key naming with prefix
- Mock `safeStorage` for consistent testing

### Integration Tests

- Test IPC handler flow
- Test preload API exposure
- Test interaction with electron-store
- Test cross-process communication

### Security Tests

- Verify encrypted data cannot be read directly from storage file
- Verify plaintext never stored when using secure API
- Verify proper error when encryption unavailable
- Verify audit logging captures all operations

## Migration Strategy

### Existing Applications

No automatic migration. Developers must:
1. Identify sensitive data currently in plain storage
2. Use `secureStore.set()` to store encrypted version
3. Delete plaintext version using `store.delete()`
4. Update application code to use `secureStore.get()`

### Example Migration Code

```javascript
// Migrate API key from plaintext to encrypted
async function migrateApiKey() {
  const apiKey = await window.api.store.get('apiKey');
  if (apiKey && !(await window.api.secureStore.has('apiKey'))) {
    await window.api.secureStore.set('apiKey', apiKey);
    await window.api.store.delete('apiKey');
    console.log('Migrated API key to encrypted storage');
  }
}
```

## Usage Guidelines

### When to Use Secure Storage

**Use `secureStore` for:**
- API keys and secrets
- Authentication tokens
- User credentials
- Encryption keys
- Personal identifiable information (PII)
- OAuth tokens and refresh tokens

**Use regular `store` for:**
- Application preferences
- UI state
- Non-sensitive configuration
- Cache data
- Public settings

### Example Usage

```javascript
// Store encrypted API key
await window.api.secureStore.set('openai_api_key', 'sk-abc123...');

// Retrieve decrypted API key
const apiKey = await window.api.secureStore.get('openai_api_key');

// Check if key exists
if (await window.api.secureStore.has('openai_api_key')) {
  console.log('API key configured');
}

// Delete encrypted key
await window.api.secureStore.delete('openai_api_key');

// Check encryption availability
if (await window.api.secureStore.isAvailable()) {
  // Safe to use secure storage
}
```

## Future Enhancements

### Out of Scope for This Change

1. **Key Rotation**: Ability to re-encrypt data with new keys
2. **Multi-User Support**: Per-user encryption in shared environments
3. **Remote Sync**: Synchronizing encrypted secrets across devices
4. **Key Backup**: Exporting/importing encrypted secrets
5. **TTL/Expiration**: Auto-expiring secrets

These features may be addressed in future proposals.

## References

- [Electron safeStorage API](https://www.electronjs.org/docs/latest/api/safe-storage)
- [macOS Keychain Services](https://developer.apple.com/documentation/security/keychain_services)
- [Windows DPAPI](https://docs.microsoft.com/en-us/windows/win32/api/dpapi/)
- [Linux libsecret](https://wiki.gnome.org/Projects/Libsecret)
