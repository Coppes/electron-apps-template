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
    const registeredIds = [];

    tabs.forEach((tab) => {
      const commandId = `switch-to-tab-${tab.id}`;
      registerCommand({
        id: commandId,
        label: `${t('command.switch_to', 'Switch to')}: ${tab.title}`,
        group: 'Open Tabs',
        action: () => setActiveTab(tab.id),
      });
      registeredIds.push(commandId);
    });

    // Cleanup: Unregister commands when tabs change
    return () => {
      registeredIds.forEach((id) => unregisterCommand(id));
    };
  }, [tabs, registerCommand, unregisterCommand, setActiveTab, t]);
}
