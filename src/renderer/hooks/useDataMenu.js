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

        // Show some global loading state? 
        // For now, we'll just process it. Ideally, we'd have a global toaster or status.
        console.log('Importing data from:', filePath);

        const result = await window.electronAPI.data.import(filePath);

        if (result.success) {
          // Notify user via alert or toast (mocked for now)
          alert(`Imported ${result.data ? 'data' : 'file'} successfully!`);
        } else {
          alert(`Import failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Menu import error:', error);
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

        console.log('Exporting data to:', filePath);

        // Use 'settings' preset by default for menu action
        const result = await window.electronAPI.data.exportPreset(filePath, 'settings');

        if (result.success) {
          alert(`Exported data successfully to ${result.path}`);
        } else {
          alert(`Export failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Menu export error:', error);
        alert(`Export error: ${error.message}`);
      }
    };

    // Register listeners using the exposed API
    const removeListener = window.electronAPI.events.onMenuAction((action, data) => {
      switch (action) {
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
