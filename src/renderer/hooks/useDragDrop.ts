/**
 * useDragDrop Hook
 * Custom React hook for handling drag-and-drop operations
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for handling drag-and-drop file operations
 * @param {object} options - Configuration options
 * @param {function} options.onDrop - Callback when files are dropped
 * @param {function} options.onError - Callback when error occurs
 * @param {boolean} options.multiple - Allow multiple files (default: true)
 * @param {Array<string>} options.accept - Accepted file extensions
 * @returns {object} Drag and drop state and handlers
 */
export function useDragDrop(options = {}) {
  const {
    onDrop,
    onError,
    multiple = true,
    accept = []
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [dragCounter, setDragCounter] = useState(0);

  // Handle drag enter
  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragCounter(prev => prev + 1);

    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragging(false);
      }
      return newCount;
    });
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    // Set drop effect
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
    setDragCounter(0);
    setIsProcessing(true);

    try {
      // Extract files from drop event
      const files = Array.from(event.dataTransfer.files);

      // Check multiple files constraint
      if (!multiple && files.length > 1) {
        if (onError) {
          onError(new Error('Only one file is allowed'));
        }
        return;
      }

      // Extract file paths and filter out non-file drops (web elements)
      // Use webUtils via preload to get path if file.path is undefined (Electron security)
      const filePaths = files
        .map(file => {
          if (file.path) return file.path;
          if (window.electronAPI?.file?.getPath) {
            try {
              return window.electronAPI.file.getPath(file);
            } catch (e) {
              // Ignore error, return null
              return null;
            }
          }
          return null;
        })
        .filter(path => !!path);

      if (filePaths.length === 0) {
        // Not a file drop (e.g. text selection)
        setIsProcessing(false);
        return;
      }

      // Encode accept as array if it is a string
      const acceptArray = Array.isArray(accept)
        ? accept
        : (typeof accept === 'string' ? accept.split(',').map(s => s.trim()) : []);

      // Call IPC to validate and process files
      // use electronAPI.file.drop if available, or invoke directly
      const result = await window.electronAPI.invoke('file:drop', {
        filePaths,
        options: {
          allowedExtensions: acceptArray.length > 0 ? acceptArray : undefined
        }
      });

      if (result.success) {
        // Call onDrop with valid files
        if (onDrop) {
          onDrop(result.validFiles, result);
        }

        // Report invalid files if any
        if (result.invalid > 0 && onError) {
          const errors = result.invalidFiles
            .map(f => `${f.path}: ${f.error}`)
            .join(', ');
          onError(new Error(`Invalid files: ${errors}`));
        }
      } else {
        if (onError) {
          onError(new Error(result.error || 'File drop failed'));
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Drop error:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [multiple, accept, onDrop, onError]);

  // Handle drag from app to desktop
  const startDrag = useCallback(async (filePath, icon) => {
    try {
      const result = await window.electronAPI.invoke('file:drag-start', {
        filePath,
        icon
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Drag start error:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setDragCounter(0);
      setIsDragging(false);
      setIsProcessing(false);
    };
  }, []);

  return {
    // State
    isDragging,
    isProcessing,

    // Event handlers for drop zone
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    },

    // Function to initiate drag from app
    startDrag
  };
}

export default useDragDrop;
