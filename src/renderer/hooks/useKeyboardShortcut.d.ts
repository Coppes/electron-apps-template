/**
 * Hook to register a keyboard shortcut
 * @param {Object} options
 * @param {string} options.id - Unique ID
 * @param {string} options.keys - Key combo (e.g. "Ctrl+K")
 * @param {Function} options.action - Action to perform
 * @param {string} [options.description] - Description for UI
 */
export declare function useKeyboardShortcut({ id, keys, action, description, allowInInput }: {
    id: any;
    keys: any;
    action: any;
    description: any;
    allowInInput?: boolean;
}): void;
