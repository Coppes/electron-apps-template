export declare const osHandlers: {
    'dock:set-badge': (event: any, { text }: {
        text: any;
    }) => Promise<{
        success: boolean;
    }>;
    'dock:set-menu': (event: any, { template }: {
        template: any;
    }) => Promise<{
        success: boolean;
    }>;
    'tray:set-status': (event: any, { status }: {
        status: any;
    }) => Promise<{
        success: boolean;
    }>;
};
