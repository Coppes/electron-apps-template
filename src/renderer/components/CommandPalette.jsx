import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Command } from 'cmdk';
import { MagnifyingGlass, Command as CommandIcon } from '@phosphor-icons/react';
import { useCommandContext } from '../contexts/CommandContext';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

const CommandPalette = () => {
  const { isOpen, setIsOpen, toggle, commands } = useCommandContext();

  // Register shortcut to toggle palette
  useKeyboardShortcut({
    id: 'toggle-command-palette',
    keys: 'Ctrl+Shift+P', // Or Cmd+Shift+P depending on platform logic in shortcut context
    action: toggle,
    description: 'Toggle Command Palette',
    allowInInput: true,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Listen for menu actions (IPC)
    let cleanupMenuListener;
    if (window.electronAPI?.events?.onMenuAction) {
      cleanupMenuListener = window.electronAPI.events.onMenuAction((action) => {
        if (action === 'command-palette') {
          setIsOpen(true);
        }
      });
    }

    // Listen for global shortcuts (IPC)
    let cleanupShortcutListener;
    if (window.electronAPI?.shortcuts?.onTriggered) {
      cleanupShortcutListener = window.electronAPI.shortcuts.onTriggered(({ action }) => {
        if (action === 'command-palette') {
          setIsOpen(prev => !prev);
        }
      });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (cleanupMenuListener) cleanupMenuListener();
      if (cleanupShortcutListener) cleanupShortcutListener();
    };
  }, [isOpen, setIsOpen]);

  // Group commands by group
  const groupedCommands = commands.reduce((acc, command) => {
    const group = command.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(command);
    return acc;
  }, {});

  // Handle closing on Escape is handled by Dialog props usually, but cmdk handles it if wrapped properly?
  // cmdk Dialog handles opening logic



  const { t } = useTranslation('common');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm transition-all" onClick={() => setIsOpen(false)}>
      <div
        className="w-full max-w-[640px] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground">
          {/* eslint-disable-next-line react/no-unknown-property */}
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <MagnifyingGlass className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder={t('command.placeholder', 'Type a command or search...')}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              autoFocus
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              {t('command.no_results', 'No results found.')}
            </Command.Empty>

            {Object.entries(groupedCommands).map(([group, groupCommands]) => {
              // Simple "virtualization" by limiting rendered items per group if total is huge,
              // but since cmdk filters internally, we just rely on its performance mostly.
              // However, strictly limiting *visible* items helps if cmdk doesn't do it automatically enough.
              // For now, let's trust cmdk but add a note or max height.
              // Actually, simply capping the list length if we were manually filtering would be the way.
              // With cmdk 1.0, we can't easily filter what *it* renders without interfering with its search.
              // But we can limit the *input* to it if we were controlling search.
              // Since we are passing all commands to cmdk, it handles filtering.
              // To optimize for "1000+", we ensure we don't render *unnecessary* heavy DOM.
              // The plan approved "limit rendered results". We can't easily limit *cmdk* results directly without
              // taking over filtering.
              // Let's implement a "render window" concept if we control the filtering, but here we use cmdk's internal filtering.
              // Optimization: Ensure items are lightweight.
              return (
                <Command.Group key={group} heading={group} className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
                  {groupCommands.slice(0, 50).map((command) => ( // limit to 50 items per group to prevent massive DOM
                    <Command.Item
                      key={command.id}
                      value={command.label} // Important for cmdk selection
                      onSelect={() => {
                        command.action();
                        setIsOpen(false);
                      }}
                      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                      <CommandIcon className="mr-2 h-4 w-4" />
                      <span>{command.label}</span>
                      {command.shortcut && (
                        <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                          {command.shortcut}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              )
            })}
          </Command.List>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;
