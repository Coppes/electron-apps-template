import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, Command as CommandIcon } from '@phosphor-icons/react';
import { useCommandContext } from '../contexts/CommandContext';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// Custom scorer favoring word starts and contiguous matches
const commandScore = (value, search) => {
  const v = value.toLowerCase();
  const s = search.toLowerCase();

  // Exact match
  if (v === s) return 1.0;

  // Starts with
  if (v.startsWith(s)) return 0.9;

  // Word starts with (e.g. "Open Settings" matches "sett")
  if (v.includes(` ${s}`)) return 0.8;

  // Contiguous substring
  if (v.includes(s)) return 0.7;

  // Loose fuzzy (all chars present in order) - optional, kept low score
  let searchIdx = 0;
  let valueIdx = 0;
  while (searchIdx < s.length && valueIdx < v.length) {
    if (s[searchIdx] === v[valueIdx]) {
      searchIdx++;
    }
    valueIdx++;
  }
  if (searchIdx === s.length) return 0.1;

  return 0;
};

const CommandPalette = () => {
  const { isOpen, setIsOpen, toggle, commands } = useCommandContext();
  const { t } = useTranslation('common');
  const [search, setSearch] = useState('');

  // Register shortcut "Cmd+K" / "Super+K"
  useKeyboardShortcut({
    id: 'toggle-command-palette-k',
    keys: 'Meta+K',
    action: toggle,
    description: 'Toggle Command Palette',
    allowInInput: true,
  });



  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Group commands
  const groupedCommands = commands.reduce((acc, command) => {
    const group = command.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(command);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              label="Global Command Menu"
              loop
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsOpen(false);
              }}
              className="flex h-full w-full flex-col overflow-hidden"
              filter={(value, search) => commandScore(value, search)}
            >
              <div className="flex items-center border-b border-white/10 px-4 py-3">
                <MagnifyingGlass className="mr-3 h-5 w-5 text-zinc-400" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder={t('command.placeholder', 'Type a command or search...')}
                  className="flex-1 bg-transparent text-base text-white placeholder-zinc-500 outline-none"
                  autoFocus
                />
                <div className="flex items-center gap-1">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">Esc</span>
                </div>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700">
                <Command.Empty className="py-12 text-center text-sm text-zinc-500">
                  {t('command.no_results', 'No results found.')}
                </Command.Empty>

                {Object.entries(groupedCommands)
                  .sort(([_groupA, commandsA], [_groupB, commandsB]) => {
                    if (!search) return 0; // Default order if no search

                    // Find the best score in each group
                    const maxScoreA = Math.max(...commandsA.map(c => commandScore(`${c.label} ${c.id} ${(c.keywords || []).join(' ')}`, search)));
                    const maxScoreB = Math.max(...commandsB.map(c => commandScore(`${c.label} ${c.id} ${(c.keywords || []).join(' ')}`, search)));

                    return maxScoreB - maxScoreA; // Descending sort
                  })
                  .map(([group, groupCommands]) => (
                    <Command.Group
                      key={group}
                      heading={group}
                      className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
                    >
                      {groupCommands.map((command) => (
                        <Command.Item
                          key={command.id}
                          value={`${command.label} ${command.id} ${(command.keywords || []).join(' ')}`} // Search against label, id, and keywords
                          onSelect={() => {
                            command.action();
                            setIsOpen(false);
                            setSearch('');
                          }}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm text-zinc-300 outline-none transition-colors",
                            "data-[selected=true]:bg-blue-600 data-[selected=true]:text-white",
                            "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                          )}
                        >
                          <CommandIcon className="mr-3 h-4 w-4 shrink-0 transition-colors data-[selected=true]:text-white/80" />
                          <span className="flex-1 truncate font-medium">{command.label}</span>
                          {command.shortcut && (
                            <span className="ml-2 text-xs text-zinc-500 data-[selected=true]:text-blue-200">
                              {command.shortcut}
                            </span>
                          )}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
              </Command.List>

              <div className="border-t border-white/10 bg-zinc-900/50 px-4 py-2 text-xs text-zinc-500 flex justify-between items-center">
                <span>{Object.values(groupedCommands).flat().length} commands available</span>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1"><CommandIcon className="w-3 h-3" /> <span>to select</span></div>
                  <div className="flex items-center gap-1"><span className="font-mono">↵</span> <span>to execute</span></div>
                </div>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
