import { useState, useEffect } from 'react';

/**
 * Hook for handling file opening events (file associations)
 * @returns {Object} Last opened file info
 */
export function useFileHandler() {
  const [lastOpenedFile, setLastOpenedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);

  useEffect(() => {
    if (!window.electronAPI?.os?.onFileOpened) {
      // eslint-disable-next-line no-console
      console.warn('File Handler API not available');
      return;
    }

    const cleanup = window.electronAPI.os.onFileOpened(({ filePath, content }) => {
      // eslint-disable-next-line no-console
      console.log('File opened:', filePath);
      setLastOpenedFile(filePath);
      setFileContent(content);
    });

    return cleanup;
  }, []);

  return { lastOpenedFile, fileContent };
}
