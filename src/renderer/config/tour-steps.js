export const TOUR_STEPS = [
    {
        target: 'body',
        title: 'Welcome to Electron App Template',
        content: 'This guided tour will walk you through the key features of this application.',
        placement: 'center',
        disableBeacon: true,
    },
    {
        target: '[data-tour="sidebar-nav"]',
        title: 'Navigation',
        content: 'Use the sidebar to navigate between different sections like Dashboard, Settings, and Demos.',
    },
    {
        target: 'body',
        title: 'Command Palette',
        content: 'Press Cmd+K (or Ctrl+K) to access the Command Palette for quick actions.',
        placement: 'center',
    },
    {
        target: '[data-tour="settings-link"]',
        title: 'Settings',
        content: 'Configure application preferences, themes, and shortcuts here.',
    },
    {
        target: 'body',
        title: 'You are all set!',
        content: 'Enjoy using the app. You can restart this tour anytime from the Help menu.',
        placement: 'center',
    }
];
