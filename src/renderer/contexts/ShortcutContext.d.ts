export declare const useShortcutContext: () => {
    shortcuts: any[];
    registerShortcut: () => void;
    unregisterShortcut: () => void;
};
export declare const ShortcutProvider: {
    ({ children }: {
        children: any;
    }): import("react/jsx-runtime").JSX.Element;
    propTypes: {
        children: any;
    };
};
