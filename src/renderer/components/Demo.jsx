import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

function Demo() {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetTitle = async () => {
    if (!title.trim()) {
      setStatus('Por favor, digite um título');
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.electronAPI.setTitle(title);
      if (result.success) {
        setStatus(`✓ Título alterado para: "${result.title}"`);
        setTitle('');
      }
    } catch (error) {
      setStatus(`✗ Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSetTitle();
    }
  };

  return (
    <section className="p-6 bg-card border border-border rounded-lg">
      <h2 className="text-xl font-semibold mb-6">Demo - Electron IPC</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title-input" className="text-sm font-medium">
            Novo Título da Janela
          </label>
          <Input
            id="title-input"
            type="text"
            placeholder="Digite um novo título..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleSetTitle}
          disabled={isLoading || !title.trim()}
          className="w-full"
        >
          {isLoading ? 'Alterando...' : 'Alterar Título'}
        </Button>

        {status && (
          <div
            className={`p-3 rounded text-sm ${
              status.startsWith('✓')
                ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100'
                : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100'
            }`}
          >
            {status}
          </div>
        )}
      </div>
    </section>
  );
}

export default Demo;
