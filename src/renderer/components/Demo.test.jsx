import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Demo from './Demo';

// Mock da electronAPI
vi.stubGlobal('electronAPI', {
  setTitle: vi.fn(() => Promise.resolve({ success: true, title: 'Test' })),
  onUpdateCounter: vi.fn(() => () => {}),
});

describe('Demo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o componente Demo', () => {
    render(<Demo />);

    expect(screen.getByText(/Demo - Electron IPC/i)).toBeInTheDocument();
  });

  it('deve exibir input e botão', () => {
    render(<Demo />);

    const input = screen.getByPlaceholderText(/Digite um novo título/i);
    const button = screen.getByRole('button', { name: /Alterar Título/i });

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('deve desabilitar botão quando input está vazio', () => {
    render(<Demo />);

    const button = screen.getByRole('button', { name: /Alterar Título/i });
    expect(button).toBeDisabled();
  });

  it('deve habilitar botão quando input tem texto', () => {
    render(<Demo />);

    const input = screen.getByPlaceholderText(/Digite um novo título/i);
    const button = screen.getByRole('button', { name: /Alterar Título/i });

    fireEvent.change(input, { target: { value: 'Novo Título' } });

    expect(button).not.toBeDisabled();
  });

  it('deve chamar electronAPI.setTitle ao clicar no botão', async () => {
    render(<Demo />);

    const input = screen.getByPlaceholderText(/Digite um novo título/i);
    const button = screen.getByRole('button', { name: /Alterar Título/i });

    fireEvent.change(input, { target: { value: 'Novo Título' } });
    fireEvent.click(button);

    expect(window.electronAPI.setTitle).toHaveBeenCalledWith('Novo Título');
  });
});
