import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../../src/renderer/App';
import { SettingsProvider } from '../../../src/renderer/contexts/SettingsContext';
import { TabProvider } from '../../../src/renderer/contexts/TabContext';
import { StatusBarProvider } from '../../../src/renderer/contexts/StatusBarContext';
import { CommandProvider } from '../../../src/renderer/contexts/CommandContext';
import { HistoryProvider } from '../../../src/renderer/contexts/HistoryContext';
import { ShortcutProvider } from '../../../src/renderer/contexts/ShortcutContext';
import { TourProvider } from '../../../src/renderer/contexts/TourContext';
import { PluginProvider } from '../../../src/renderer/contexts/PluginContext';

const renderApp = () => {
  return render(
    <SettingsProvider>
      <StatusBarProvider>
        <ShortcutProvider>
          <CommandProvider>
            <HistoryProvider>
              <PluginProvider>
                <TourProvider>
                  <TabProvider>
                    <App />
                  </TabProvider>
                </TourProvider>
              </PluginProvider>
            </HistoryProvider>
          </CommandProvider>
        </ShortcutProvider>
      </StatusBarProvider>
    </SettingsProvider>
  );
};

describe('App Component', () => {
  it('deve renderizar o componente App sem erros', async () => {
    renderApp();

    await expect(screen.findByText(/app.name/i)).resolves.toBeInTheDocument();
  });

  it('deve exibir o header com título', async () => {
    renderApp();

    const heading = await screen.findByRole('heading', {
      name: /app.name/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('deve exibir características da aplicação (DropZone)', async () => {
    renderApp();

    await expect(screen.findByText(/home.drop_title/i)).resolves.toBeInTheDocument();
    expect(screen.getByText(/home.drop_desc/i)).toBeInTheDocument();
    expect(screen.getByText(/home.open_file/i)).toBeInTheDocument();
  });

  it('deve mostrar botões de navegação', async () => {
    renderApp();

    // Since we mock t(key) => key, and AppShell uses 🏠 {t('nav.home')}
    // The output will be "🏠 nav.home"
    const homeButtons = await screen.findAllByText(/nav.home/i);
    expect(homeButtons.length).toBeGreaterThan(0);

    // Check for "Demos" section items
    const dataManagementLink = screen.getByText(/nav.items.data_mgmt/i);
    expect(dataManagementLink).toBeInTheDocument();

    const connectivityLink = screen.getByText(/nav.items.connectivity/i);
    expect(connectivityLink).toBeInTheDocument();

    const ipcLink = screen.getByText(/nav.items.ipc/i);
    expect(ipcLink).toBeInTheDocument();

    const secureStorageLink = screen.getByText(/nav.items.secure_storage/i);
    expect(secureStorageLink).toBeInTheDocument();

    // Check for standard items
    const settingsButtons = screen.getAllByText(/nav.items.settings/i);
    expect(settingsButtons.length).toBeGreaterThan(0);

    const aboutButtons = screen.getAllByText(/nav.items.about/i);
    expect(aboutButtons.length).toBeGreaterThan(0);
  });

  it('deve renderizar a página inicial por padrão', async () => {
    renderApp();

    const heading = await screen.findByText(/app.name/i);
    expect(heading).toBeInTheDocument();
  });
});
