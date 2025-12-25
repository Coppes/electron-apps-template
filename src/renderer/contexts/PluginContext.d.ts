export declare const usePlugins: () => {
    plugins: any[];
    commands: any[];
    registerCommand: () => void;
};
export declare const PluginProvider: {
    ({ children }: {
        children: any;
    }): import("react/jsx-runtime").JSX.Element;
    propTypes: {
        children: any;
    };
};
