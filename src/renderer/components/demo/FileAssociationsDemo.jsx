import { FileText, Keyboard } from '@phosphor-icons/react';
import { useFileHandler } from '../../hooks/useFileHandler';

export default function FileAssociationsDemo() {
  const { lastOpenedFile, fileContent } = useFileHandler();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">File Associations</h2>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Last Opened File</h3>

        {lastOpenedFile ? (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-500 uppercase">File Path</span>
              <p className="font-mono text-sm mt-1 text-gray-900 dark:text-white break-all">{lastOpenedFile}</p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-500 uppercase">Content Preview</span>
              <pre className="mt-2 text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40 whitespace-pre-wrap">
                {fileContent || '(Empty or binary content)'}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900 rounded">
            No file opened yet via OS association. <br />
            Try opening a file with the app (or drag a .myapp file onto the app icon).
          </div>
        )}
      </div>

      {/* Spellcheck Test Area */}
      <div className="flex items-center gap-2 mb-4 mt-8">
        <Keyboard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Native Spellcheck</h2>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Type some misspelled words below (e.g. &quot;tehst&quot;, &quot;spleling&quot;) and right-click to see native suggestions.
        </p>
        <textarea
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          placeholder="Type here to test spellcheck..."
        />
      </div>
    </div>
  );
}
