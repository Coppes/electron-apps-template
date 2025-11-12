# Add Secure Storage

## Why

The application currently stores all data in plain text using `electron-store`. For sensitive information like API keys, authentication tokens, user credentials, and other secrets, this presents a security risk if the storage file is accessed by malware or unauthorized users. Electron provides `safeStorage` API which uses OS-level encryption (Keychain on macOS, DPAPI on Windows, libsecret on Linux) to encrypt data at rest. Modern desktop applications handling sensitive data must protect secrets using platform-native encryption mechanisms. This change adds encrypted storage capabilities to enable secure handling of sensitive application data without custom cryptographic implementations.

## What Changes

- **Encrypted Storage Module**: Create `src/main/security/encrypted-storage.js` that wraps Electron's `safeStorage` API, providing encryption/decryption functions with OS-level keychain integration and graceful handling of encryption availability
- **Secure Store API**: Expose `secureStore` API to renderer via preload/contextBridge with methods: `set(key, value)`, `get(key)`, `delete(key)`, `has(key)`, `isAvailable()` for storing encrypted data
- **IPC Handlers**: Add IPC handlers in `src/main/ipc/handlers/secure-store.js` for secure storage operations with validation and comprehensive error handling
- **Storage Format**: Store encrypted data in electron-store with `__ENCRYPTED__` prefix to separate encrypted from plaintext data, using base64-encoded encrypted buffers
- **Permission Management**: Enhance existing security-hardening spec with detailed permission management requirements including configuration, auto-deny defaults, and revocation handling

## Impact

- **Affected specs**:
  - Creates 1 new capability: `encrypted-storage` - OS-level encryption for sensitive data storage
  - Modifies `add-electron-core-features/security-hardening` - Enhanced permission management requirements with configuration and detailed scenarios

- **Affected code**:
  - `src/main/security/encrypted-storage.js` - NEW: Core encryption module
  - `src/main/ipc/handlers/secure-store.js` - NEW: IPC handlers for secure storage
  - `src/main/security/permission-manager.js` - NEW: Permission request handler with configurable allowed list
  - `src/preload.js` - Add `secureStoreAPI` to contextBridge
  - `src/common/constants.js` - Add SECURE_STORE_* IPC channels
  - `src/main.js` - Integrate permission manager on app ready

- **Dependencies**: Requires Electron 9+ for `safeStorage` API (already satisfied by Electron 39)

- **Migration**: No breaking changes. New `secureStore` API runs alongside existing `store` API. Applications choose when to migrate sensitive data from plaintext to encrypted storage.

## Motivation

The application currently stores all data in plain text using `electron-store`. For sensitive information like API keys, authentication tokens, user credentials, and other secrets, this presents a security risk if the storage file is accessed by malware or unauthorized users.

Electron provides `safeStorage` API which uses OS-level encryption (Keychain on macOS, DPAPI on Windows, libsecret on Linux) to encrypt data at rest. This ensures sensitive data is protected using the same security mechanisms that protect system passwords.

## Problem Statement

- Sensitive data (API keys, tokens, credentials) is currently stored in plain text
- No built-in encryption mechanism for protecting secrets
- Risk of data exposure if electron-store files are compromised
- No standardized way to differentiate sensitive vs non-sensitive data storage

## Proposed Solution

Add encrypted storage capability using Electron's `safeStorage` API:

1. **Encrypted Storage Module** (`src/main/security/encrypted-storage.js`):
   - Wrapper around `safeStorage.encryptString()` and `safeStorage.decryptString()`
   - Store encrypted buffers in electron-store with special prefix
   - Handle encryption availability checks
   - Graceful fallback when encryption unavailable

2. **Secure Store API** (exposed via preload):
   - `secureStore:set(key, value)` - Encrypt and store sensitive data
   - `secureStore:get(key)` - Retrieve and decrypt sensitive data
   - `secureStore:delete(key)` - Remove encrypted data
   - `secureStore:has(key)` - Check if encrypted key exists

3. **Security Enhancements**:
   - Validate encryption availability before storing sensitive data
   - Log encryption operations for audit trail
   - Clear separation between plain text and encrypted storage
   - Documentation on when to use secure vs regular storage

## Scope

### In Scope

- Implement encrypted storage module using `safeStorage`
- Expose secure storage API via preload/contextBridge
- Add IPC handlers for encrypted storage operations
- Document usage patterns and security considerations
- Add tests for encryption/decryption flows
- Update security documentation

### Out of Scope

- Migrating existing electron-store data to encrypted format (manual migration)
- Key rotation or advanced cryptographic features
- Encrypted file storage (only key-value pairs)
- Custom encryption algorithms (OS-level encryption only)
- Multi-user or shared secret management

## Impact Assessment

### Benefits

- Sensitive data protected with OS-level encryption
- Zero-cost abstraction (only encrypts when needed)
- Follows platform security best practices
- Improves compliance with data protection standards
- Simple API for developers to use

### Risks

- Encryption may not be available on all systems (Linux without keychain)
- Encrypted data cannot be accessed from another machine
- Performance overhead for encryption/decryption operations (minimal)
- Breaking change if used incorrectly (must handle availability)

### Migration Strategy

No breaking changes to existing storage. New API runs alongside existing `storeAPI`. Developers choose when to use `secureStore` vs `store`.

## Dependencies

- Requires Electron 9+ for `safeStorage` API (already on Electron 39)
- Depends on OS keychain services (macOS Keychain, Windows DPAPI, Linux libsecret)
- Uses existing `electron-store` for persistence layer

## Related Changes

- Related to `add-electron-core-features/security-hardening` (security improvements)
- Complements existing `store` API in preload.js
- May inform future secure configuration management features

## References

- [Electron safeStorage documentation](https://www.electronjs.org/docs/latest/api/safe-storage)
- [OWASP: Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
