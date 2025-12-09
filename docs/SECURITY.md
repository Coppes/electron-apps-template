# 🔐 Guia de Segurança - Electron Template

Este documento descreve as práticas de segurança implementadas neste template.

## Context Isolation

O template usa **Context Isolation** habilitado em `src/main.js`:

```javascript
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  enableRemoteModule: false,
  preload: path.join(__dirname, 'preload.js'),
  sandbox: true,
}
```

### Por quê?
- **Isolamento de Contexto**: Renderer e main process rodam em contextos separados
- **Sem Node Integration**: O renderer não tem acesso direto a APIs do Node.js
- **Sandbox**: O renderer é executado em um sandbox, limitando acesso ao sistema

## Preload Script

O arquivo `src/preload.js` expõe uma API segura usando `contextBridge`:

```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.invoke('set-title', title),
  onUpdateCounter: (callback) => { /* ... */ }
});
```

### Por quê?
- **Controle de Acesso**: Apenas métodos explicitamente expostos estão disponíveis
- **Validação**: Permite validação de dados no preload antes de enviar ao main
- **Tipo-Safe**: Fornece uma API clara e tipada para o renderer

## IPC Communication

Toda comunicação usa IPC handlers (`ipcMain.handle`):

```javascript
ipcMain.handle('set-title', async (event, title) => {
  // Validação aqui
  mainWindow.setTitle(title);
  return { success: true, title };
});
```

### Boas Práticas
1. ✅ Sempre usar `invoke` (promisses) em vez de `send`
2. ✅ Validar dados no main process
3. ✅ Sanitizar strings de usuário
4. ✅ Nunca usar `eval()` ou similar
5. ✅ Usar HTTPS para comunicação externa

## Segurança de Navegação

O template desabilita navegação para URLs não autorizada:

```javascript
contents.on('will-navigate', (event, navigationUrl) => {
  const parsedUrl = new URL(navigationUrl);
  if (parsedUrl.origin !== 'http://localhost:3000') {
    event.preventDefault();
  }
});
```

## Content Security Policy

Para reforçar segurança, adicione CSP headers no HTML:

```html
<meta 
  http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline'; 
           style-src 'self' 'unsafe-inline';"
/>
```

## Boas Práticas Gerais

### ✅ Faça
- Use HTTPS para APIs externas
- Valide todos os dados do usuário
- Use tokens JWT com expiração
- Implemente rate limiting
- Mantenha Electron e dependências atualizadas
- Revise o código regularmente
- Use variáveis de ambiente para secrets

### ❌ Não Faça
- Não exponha o objeto Electron inteiro
- Não use `eval()` ou `Function()` com dados do usuário
- Não armazene secrets no código-fonte
- Não desabilite sandbox
- Não use `nodeIntegration: true`
- Não envie dados sensíveis em plain text

## Encrypted Storage

O template inclui suporte a armazenamento criptografado para dados sensíveis usando a API `safeStorage` do Electron.

### O que é Encrypted Storage?

Encrypted Storage protege dados sensíveis (API keys, tokens, credenciais) usando criptografia a nível de sistema operacional:

- **macOS**: Keychain
- **Windows**: DPAPI (Data Protection API)
- **Linux**: libsecret

### Quando Usar?

Use `secureStore` para dados sensíveis:

- ✅ API keys e tokens de autenticação
- ✅ Credenciais de usuário
- ✅ Secrets da aplicação
- ✅ Chaves de criptografia

Use `store` regular para dados não-sensíveis:

- ✅ Preferências do usuário
- ✅ Configurações da UI
- ✅ Cache de dados públicos

### Como Usar

#### Verificar Disponibilidade

```javascript
const available = await window.electronAPI.secureStore.isAvailable();
if (!available) {
  console.warn('Encryption not available on this platform');
}
```

#### Armazenar Dados Criptografados

```javascript
// Armazenar API key
await window.electronAPI.secureStore.set('apiKey', 'my-secret-key-123');

// Armazenar objeto
await window.electronAPI.secureStore.set('credentials', {
  username: 'user@example.com',
  token: 'abc123xyz'
});
```

#### Recuperar Dados

```javascript
// Recuperar API key
const apiKey = await window.electronAPI.secureStore.get('apiKey');

// Recuperar objeto
const credentials = await window.electronAPI.secureStore.get('credentials');
console.log(credentials.username); // 'user@example.com'
```

#### Verificar Existência

```javascript
const hasKey = await window.electronAPI.secureStore.has('apiKey');
if (hasKey) {
  const key = await window.electronAPI.secureStore.get('apiKey');
}
```

#### Deletar Dados

```javascript
await window.electronAPI.secureStore.delete('apiKey');
```

### Disponibilidade por Plataforma

| Plataforma | Backend | Disponibilidade |
|------------|---------|-----------------|
| macOS | Keychain | Sempre disponível |
| Windows | DPAPI | Sempre disponível |
| Linux | libsecret | Requer instalação |

#### Linux

No Linux, `libsecret` precisa estar instalado:

```bash
# Debian/Ubuntu
sudo apt-get install libsecret-1-dev

# Fedora/RHEL
sudo dnf install libsecret-devel

# Arch
sudo pacman -S libsecret
```

### Tratamento de Erros

Sempre trate casos onde a criptografia não está disponível:

```javascript
async function saveApiKey(key) {
  try {
    const available = await window.electronAPI.secureStore.isAvailable();
    
    if (!available) {
      // Avise o usuário
      alert('Encrypted storage not available. Please install required system packages.');
      return;
    }
    
    await window.electronAPI.secureStore.set('apiKey', key);
    console.log('API key saved securely');
  } catch (error) {
    console.error('Failed to save API key:', error);
    alert('Failed to save API key securely');
  }
}
```

### Migração de Dados

Para migrar dados existentes de plaintext para criptografados:

```javascript
async function migrateToEncrypted() {
  // 1. Verificar se encrypted storage está disponível
  const available = await window.electronAPI.secureStore.isAvailable();
  if (!available) {
    console.warn('Cannot migrate: encryption not available');
    return;
  }
  
  // 2. Recuperar dados em plaintext
  const apiKey = await window.electronAPI.store.get('apiKey');
  
  if (apiKey) {
    // 3. Salvar em formato criptografado
    await window.electronAPI.secureStore.set('apiKey', apiKey);
    
    // 4. Remover versão plaintext
    await window.electronAPI.store.delete('apiKey');
    
    console.log('Migration completed successfully');
  }
}
```

### Considerações de Segurança

#### Best Practices

**Faça:**

- Sempre verifique disponibilidade antes de usar
- Use encrypted storage para todos os dados sensíveis
- Implemente migração de dados existentes
- Trate erros de criptografia adequadamente
- Documente quais dados são criptografados

**Não Faça:**

- Não armazene dados sensíveis em plaintext
- Não assuma que criptografia está sempre disponível
- Não ignore erros de criptografia
- Não misture dados sensíveis e não-sensíveis
- Não exponha dados decriptografados desnecessariamente

### Limitações

- **Portabilidade**: Dados criptografados não podem ser acessados de outra máquina
- **Backup**: Dados criptografados podem não ser incluídos em backups do sistema
- **Performance**: Criptografia adiciona pequeno overhead (geralmente negligível)
- **Linux**: Requer `libsecret` instalado

## Auditoria de Segurança

Para verificar vulnerabilidades nas dependências:

```bash
npm audit
npm audit fix
```

## Atualizações

Mantenha as dependências atualizadas:

```bash
npm update
npm outdated
```

## Referências

- [Electron Security Checklist](https://www.electronjs.org/docs/tutorial/security)
- [OWASP Security Guidelines](https://owasp.org/)
- [Secure Coding Practices](https://cwe.mitre.org/)

---

**Segurança é uma responsabilidade contínua. Revise este documento regularmente.**
