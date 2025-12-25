/**
 * useDragDrop Hook
 * Custom React hook for handling drag-and-drop operations
 */
/**
 * Hook for handling drag-and-drop file operations
 * @param {object} options - Configuration options
 * @param {function} options.onDrop - Callback when files are dropped
 * @param {function} options.onError - Callback when error occurs
 * @param {boolean} options.multiple - Allow multiple files (default: true)
 * @param {Array<string>} options.accept - Accepted file extensions
 * @returns {object} Drag and drop state and handlers
 */
export declare function useDragDrop(options?: {}): {
    isDragging: boolean;
    isProcessing: boolean;
    dragHandlers: {
        onDragEnter: (event: any) => void;
        onDragLeave: (event: any) => void;
        onDragOver: (event: any) => void;
        onDrop: (event: any) => Promise<void>;
    };
    startDrag: (filePath: any, icon: any) => Promise<any>;
};
export default useDragDrop;
