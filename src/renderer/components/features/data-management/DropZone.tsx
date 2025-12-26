/**
 * DropZone Component
 * Provides a visual drop zone for file drag-and-drop operations
 */

import React from 'react';
import { useDragDrop } from '../../../hooks/useDragDrop';

interface DropZoneProps {
  onDrop?: (files: File[]) => void;
  onError?: (error: any) => void;
  multiple?: boolean;
  accept?: string[] | string;
  children?: React.ReactNode;
  className?: string;
  activeClassName?: string;
  disabled?: boolean;
}

/**
 * DropZone component with drag-and-drop support
 */
export function DropZone({
  onDrop,
  onError,
  multiple = true,
  accept = [],
  children,
  className = '',
  activeClassName = '',
  disabled = false
}: DropZoneProps) {
  const { isDragging, isProcessing, dragHandlers } = useDragDrop({
    onDrop,
    onError,
    multiple,
    accept
  });

  // Build class names
  const baseClasses = `
    relative
    min-h-[200px]
    border-2
    border-dashed
    border-gray-300
    dark:border-gray-600
    rounded-lg
    transition-all
    duration-200
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Note: simplified dynamic classes for brevity and to ensure standard styling
  const dragClasses = isDragging
    ? `
      border-blue-500
      bg-blue-50
      dark:bg-blue-900/20
      ${activeClassName}
    `.trim().replace(/\s+/g, ' ')
    : `
      hover:border-gray-400
      dark:hover:border-gray-500
    `.trim().replace(/\s+/g, ' ');

  const processingClasses = isProcessing
    ? 'opacity-75 pointer-events-none'
    : '';

  const finalClassName = `${baseClasses} ${dragClasses} ${processingClasses}`;

  // Disable handlers if disabled
  const handlers = disabled ? {} : dragHandlers;

  const acceptedExts = Array.isArray(accept) ? accept : [accept];

  // Helper to display content
  const renderDefaultContent = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {isProcessing ? (
        <>
          <div className="w-12 h-12 mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">
            Processing files...
          </p>
        </>
      ) : isDragging ? (
        <>
          <svg
            className="w-16 h-16 mb-4 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
            Drop files here
          </p>
        </>
      ) : (
        <>
          <svg
            className="w-16 h-16 mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-200">
            Drag and drop files here
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {multiple ? 'or click to select files' : 'or click to select a file'}
          </p>
          {acceptedExts.length > 0 && acceptedExts[0] && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Accepted: {acceptedExts.join(', ')}
            </p>
          )}
        </>
      )}
    </div>
  );

  return (
    <div
      className={finalClassName}
      {...handlers}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="File drop zone"
      aria-disabled={disabled}
    >
      {children || renderDefaultContent()}
    </div>
  );
}

export default DropZone;
