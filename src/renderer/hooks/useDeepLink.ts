import { useEffect } from 'react';
import { useTabContext } from '../contexts/TabContext';
import { useCommandContext } from '../contexts/CommandContext';

/**
 * Hook to handle deep link events
 */
export function useDeepLink() {
  const { addTab } = useTabContext();
  /* eslint-disable no-unused-vars */
  const { commands } = useCommandContext();
  /* eslint-enable no-unused-vars */

  useEffect(() => {
    // Listen for deep link events
    const cleanup = window.electronAPI.deepLink.onReceived(async (data: any) => {
      const { route, pathParams, params } = data;

      try {
        switch (route) {
          case 'open-file':
            if (params.file) {
              try {
                const result = await window.electronAPI.file.validatePath(params.file);
                if (result.success) {
                  addTab({
                    id: `file-${Date.now()}`,
                    title: params.file.split('/').pop(),
                    type: 'editor',
                    data: { filePath: params.file }
                  });
                }
              } catch (err: any) {
                if (window.electronAPI?.notifications) {
                  window.electronAPI.notifications.show({
                    title: 'File Open Error',
                    body: `Failed to open file: ${err.message}`,
                    urgency: 'normal'
                  });
                }
              }
            }
            break;

          case 'new-item':
            addTab({
              id: `new-${Date.now()}`,
              title: 'New Document',
              type: 'editor',
              data: { content: '' }
            });
            break;

          case 'settings-section':
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
                type: 'preview',
                data: { id: pathParams.id }
              });
            }
            break;

          default:
            // eslint-disable-next-line no-console
            console.warn('Unknown deep link route:', route);
            if (window.electronAPI?.notifications) {
              window.electronAPI.notifications.show({
                title: 'Invalid Link',
                body: `Unknown action: ${route}`,
                urgency: 'normal'
              });
            }
        }
      } catch (error: any) {
        if (window.electronAPI?.notifications) {
          window.electronAPI.notifications.show({
            title: 'Deep Link Error',
            body: `Failed to handle link: ${error.message}`,
            urgency: 'normal'
          });
        }
      }
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
      else if (cleanup && typeof (cleanup as any).unsubscribe === 'function') (cleanup as any).unsubscribe();
    };
  }, [addTab]);
}
