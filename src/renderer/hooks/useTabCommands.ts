import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTabContext } from '../contexts/TabContext';
import { useCommandContext } from '../contexts/CommandContext';

/**
 * Registers commands to switch to each open tab.
 */
export function useTabCommands() {
  const { tabs, setActiveTab } = useTabContext();
  const { registerCommand, unregisterCommand } = useCommandContext();
  const { t } = useTranslation('common');

  useEffect(() => {
    // Register a command for each tab
    const registeredIds: string[] = [];

    tabs.forEach((tab) => {
      const commandId = `switch-to-tab-${tab.id}`;
      const keywords = [];
      if (tab.type === 'settings') keywords.push('Settings');
      if (tab.type === 'home') keywords.push('Home');
      if (tab.type === 'demo') keywords.push('Demo');
      if (tab.type === 'test') keywords.push('Test');
      if (tab.title && tab.title !== 'New Tab') keywords.push(tab.title); // Add title itself as keyword just in case

      registerCommand({
        id: commandId,
        label: `${t('command.switch_to', 'Switch to')}: ${tab.title}`,
        group: 'Open Tabs',
        action: () => setActiveTab(tab.id),
        keywords,
      });
      registeredIds.push(commandId);
    });

    // Cleanup: Unregister commands when tabs change
    return () => {
      registeredIds.forEach((id) => unregisterCommand(id));
    };
  }, [tabs, registerCommand, unregisterCommand, setActiveTab, t]);
}
