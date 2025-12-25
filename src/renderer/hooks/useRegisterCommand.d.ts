/**
 * Hook to register a command in the command palette
 * @param {Object} options
 * @param {string} options.id - Unique ID
 * @param {string} options.label - Display label
 * @param {Function} options.action - Action to perform
 * @param {string} [options.group] - Group name (e.g. "Navigation")
 * @param {string} [options.shortcut] - Shortcut display string
 */
export declare function useRegisterCommand({ id, label, action, group, shortcut, keywords }: {
    id: any;
    label: any;
    action: any;
    group?: string;
    shortcut: any;
    keywords?: any[];
}): void;
