import { useEffect } from 'react';

/**
 * Hook to handle global data menu actions (Import/Export)
 */
export const useDataMenu = () => {
  useEffect(() => {
    // Handler for Import Data menu item
    const handleImport = async () => {
      try {
        const filePath = await window.electronAPI.dialog.showOpenDialog({
          filters: [
            { name: 'Data', extensions: ['json', 'csv'] },
            { name: 'All Files', extensions: ['*'] }
          ],
          properties: ['openFile']
        });

        if (!filePath) return;

        // console.log('Importing data from:', filePath);

        const result = await window.electronAPI.data.importData(filePath);

        if (result.data) {
          // Notify user via alert or toast (mocked for now)
          alert(`Imported ${result.data ? 'data' : 'file'} successfully!`);
        } else {
          alert(`Import failed: ${result.error || 'Unknown error'}`);
        }
      } catch (error: any) {
        // console.error('Menu import error:', error);
        alert(`Import error: ${error.message}`);
      }
    };

    // Handler for Export Data menu item
    const handleExport = async () => {
      try {
        const filePath = await window.electronAPI.dialog.showSaveDialog({
          defaultPath: 'export_settings.json',
          filters: [
            { name: 'JSON', extensions: ['json'] }
          ]
        });

        if (!filePath) return;

        // Use 'settings' preset by default for menu action
        // Assuming exportData can handle this or fallback to generic export
        const result = await window.electronAPI.data.exportData(filePath, { preset: 'settings' });

        if (result.data?.path) {
          alert(`Exported data successfully to ${result.data.path}`);
        } else {
          alert(`Export failed: ${result.error || 'Unknown error'}`);
        }
      } catch (error: any) {
        // console.error('Menu export error:', error);
        alert(`Export error: ${error.message}`);
      }
    };

    // Register listeners using the exposed API
    const removeListener = window.electronAPI?.events?.onMenuAction((command: string, _data: any) => {
      switch (command) {
        case 'data-import':
          handleImport();
          break;
        case 'data-export':
          handleExport();
          break;
        default:
          break;
      }
    });

    // Cleanup
    return () => {
      removeListener();
    };
  }, []);
};
