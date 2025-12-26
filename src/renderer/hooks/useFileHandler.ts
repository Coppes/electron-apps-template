import { useState, useEffect } from 'react';

/**
 * Hook for handling file opening events (file associations)
 * @returns {Object} Last opened file info
 */
export function useFileHandler() {
  const [lastOpenedFile, setLastOpenedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  useEffect(() => {
    if (!window.electronAPI?.os?.onFileOpened) {
      // eslint-disable-next-line no-console
      console.warn('File Handler API not available');
      return;
    }

    const cleanup = window.electronAPI.os.onFileOpened(({ filePath, content }) => {
      console.log('File opened:', filePath);
      setLastOpenedFile(filePath);
      setFileContent(content || null);
    });

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  return { lastOpenedFile, fileContent };
}
