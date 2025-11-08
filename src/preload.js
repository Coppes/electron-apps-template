import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script - Expõe uma API segura ao renderer process
 * Usa contextBridge para isolar contextos e ipcRenderer para comunicação
 */

const electronAPI = {
  /**
   * Envia um IPC ao main process para alterar o título da janela
   * @param {string} title - O novo título da janela
   * @returns {Promise} Retorna a resposta do main process
   */
  setTitle: (title) => ipcRenderer.invoke('set-title', title),

  /**
   * Registra um listener para receber atualizações de counter do main process
   * @param {Function} callback - Função executada quando counter é atualizado
   * @returns {Function} Função para remover o listener
   */
  onUpdateCounter: (callback) => {
    const listener = (event, count) => callback(count);
    ipcRenderer.on('counter-updated', listener);

    // Retorna função para remover o listener (cleanup)
    return () => ipcRenderer.removeListener('counter-updated', listener);
  },

  /**
   * Obtém informações de versão do Electron, Node, Chrome e app
   * @returns {Promise<Object>} Objeto com versões
   */
  getVersion: () => ipcRenderer.invoke('get-version'),

  /**
   * Abre um diálogo para selecionar e ler um arquivo
   * @returns {Promise<Object>} Objeto com caminho e conteúdo do arquivo
   */
  openFile: () => ipcRenderer.invoke('open-file'),

  // Store API
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key),
  },
};

/**
 * Exponha a API segura ao context do renderer
 * Apenas estes métodos estarão disponíveis em window.electronAPI
 */
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
