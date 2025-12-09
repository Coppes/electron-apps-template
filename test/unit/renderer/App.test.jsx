import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../../src/renderer/App';

describe('App Component', () => {
  it('deve renderizar o componente App sem erros', () => {
    render(<App />);

    expect(screen.getByText(/home.title/i)).toBeInTheDocument();
  });

  it('deve exibir o header com título', () => {
    render(<App />);

    const heading = screen.getByRole('heading', {
      name: /home.title/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('deve exibir características da aplicação', () => {
    render(<App />);

    expect(screen.getByText(/home.cards.security.features.context/i)).toBeInTheDocument();
    expect(screen.getByText(/home.cards.security.features.node/i)).toBeInTheDocument();
    expect(screen.getByText(/home.cards.stack.features.shadcn/i)).toBeInTheDocument();
  });

  it('deve mostrar botões de navegação', () => {
    render(<App />);

    // Since we mock t(key) => key, and AppShell uses 🏠 {t('nav.home')}
    // The output will be "🏠 nav.home"
    const homeButtons = screen.getAllByText(/nav.home/i);
    expect(homeButtons.length).toBeGreaterThan(0);

    const demoButtons = screen.getAllByText(/nav.items.legacy_demo/i);
    expect(demoButtons.length).toBeGreaterThan(0);

    const settingsButtons = screen.getAllByText(/nav.items.settings/i);
    expect(settingsButtons.length).toBeGreaterThan(0);

    const aboutButtons = screen.getAllByText(/nav.items.about/i);
    expect(aboutButtons.length).toBeGreaterThan(0);
  });

  it('deve renderizar a página inicial por padrão', () => {
    render(<App />);

    const heading = screen.getByText(/home.title/i);
    expect(heading).toBeInTheDocument();
  });
});
