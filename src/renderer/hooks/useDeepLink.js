import { useEffect } from 'react';
import { useTabContext } from '../contexts/TabContext';
import { useCommandContext } from '../contexts/CommandContext';
/**
 * Hook to handle deep link events
 */
export function useDeepLink() {
    const { addTab } = useTabContext();
    const { executeCommand } = useCommandContext();
    useEffect(() => {
        // Listen for deep link events
        const cleanup = window.electronAPI.deepLink.onReceived(async (data) => {
            const { route, pathParams, params } = data;
            try {
                switch (route) {
                    case 'open-file':
                        if (params.file) {
                            // Open file in new tab
                            // We can use the dialog/file API to read it first or just pass path to tab
                            // Ideally, we have a way to open a file tab directly
                            // We can try to open it via the 'open-file' command if available, 
                            // or manually construct the tab.
                            // Let's assume we can add a file tab directly if we read it.
                            try {
                                // If we have an 'open.file' command, use it?
                                // Or just add a tab directly.
                                const content = await window.electronAPI.file.validatePath(params.file);
                                if (content.exists) {
                                    // read content not available via validatePath, need to read it.
                                    // Actually, let's just use the 'open-file' logic from CommandPalette/Menu if possible.
                                    // But since we are in a hook, we can just trigger the file opening logic.
                                    // Simplified: trigger open file logic if we had a helper.
                                    // For now, let's just add a tab with the file path.
                                    // Note: We might need to read the content to show it.
                                    // Let's try to assume the TabContent handles loading if we pass a path?
                                    // Currently TabContent (viewed previously) seemed to take data.
                                    addTab({
                                        id: `file-${Date.now()}`,
                                        title: params.file.split('/').pop(),
                                        type: 'editor', // Assuming 'editor' type exists
                                        data: { filePath: params.file }
                                    });
                                }
                            }
                            catch (err) {
                                if (window.electronAPI?.notification) {
                                    window.electronAPI.notification.show({
                                        title: 'File Open Error',
                                        body: `Failed to open file: ${err.message}`,
                                        urgency: 'normal'
                                    });
                                }
                            }
                        }
                        break;
                    case 'new-item':
                        // Open new document tab
                        addTab({
                            id: `new-${Date.now()}`,
                            title: 'New Document',
                            type: 'editor',
                            data: { content: '' }
                        });
                        break;
                    case 'settings-section':
                        // Open settings tab and navigate
                        addTab({
                            id: 'settings',
                            title: 'Settings',
                            type: 'settings',
                            data: { section: pathParams.section }
                        });
                        break;
                    case 'view-item':
                        if (pathParams.id) {
                            addTab({
                                id: `view-${pathParams.id}`,
                                title: `Item ${pathParams.id}`,
                                type: 'preview', // Assuming preview type
                                data: { id: pathParams.id }
                            });
                        }
                        break;
                    default:
                        // eslint-disable-next-line no-console
                        console.warn('Unknown deep link route:', route);
                        if (window.electronAPI?.notification) {
                            window.electronAPI.notification.show({
                                title: 'Invalid Link',
                                body: `Unknown action: ${route}`,
                                urgency: 'normal'
                            });
                        }
                }
            }
            catch (error) {
                if (window.electronAPI?.notification) {
                    window.electronAPI.notification.show({
                        title: 'Deep Link Error',
                        body: `Failed to handle link: ${error.message}`,
                        urgency: 'normal'
                    });
                }
            }
        });
        return cleanup;
    }, [addTab, executeCommand]);
}
