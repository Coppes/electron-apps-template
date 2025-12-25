import { useState } from 'react';
import { FileText, Plus, Trash, WarningCircle, Clock } from '@phosphor-icons/react';

/**
 * RecentDocsDemo Component
 * Demonstrates recent documents integration with OS
 */
export default function RecentDocsDemo() {
  const [filePath, setFilePath] = useState('');
  const [recentDocs, setRecentDocs] = useState([]);
  const [status, setStatus] = useState('');

  const addDocument = async () => {
    if (!filePath.trim()) {
      setStatus('Please enter a file path');
      return;
    }

    try {
      await window.electronAPI.recentDocs.add(filePath.trim());

      if (!recentDocs.includes(filePath.trim())) {
        setRecentDocs([filePath.trim(), ...recentDocs.slice(0, 9)]);
      }

      setStatus(`Added: ${filePath}`);
      setFilePath('');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const clearDocuments = async () => {
    try {
      await window.electronAPI.recentDocs.clear();
      setRecentDocs([]);
      setStatus('Recent documents cleared');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const addSampleDoc = (path) => {
    setFilePath(path);
  };

  const removeFromList = (path) => {
    setRecentDocs(recentDocs.filter(doc => doc !== path));
  };

  const samplePaths = [
    '/Users/username/Documents/report.pdf',
    '/Users/username/Downloads/presentation.pptx',
    '/Users/username/Desktop/notes.txt',
    'C:\\Users\\username\\Documents\\spreadsheet.xlsx',
    'C:\\Users\\username\\Pictures\\photo.jpg'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-6 h-6 text-indigo-600" />
        <h2 className="text-2xl font-bold">Recent Documents</h2>
      </div>

      {/* Status */}
      {status && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2">
          <WarningCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">{status}</p>
        </div>
      )}

      {/* Add Document */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Add Document to Recent List</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">File Path</label>
            <input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="/path/to/document.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter an absolute path to a file (Note: File must exist and have allowed extension)
            </p>
          </div>

          <button
            onClick={addDocument}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Recent Documents
          </button>

          <div>
            <p className="text-sm font-medium mb-2">Sample Paths (Click to use):</p>
            <div className="space-y-1">
              {samplePaths.map((path, index) => (
                <button
                  key={index}
                  onClick={() => addSampleDoc(path)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded font-mono"
                >
                  {path}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents List */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Added Documents ({recentDocs.length})</h3>
          {recentDocs.length > 0 && (
            <button
              onClick={clearDocuments}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
            >
              <Trash className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {recentDocs.length === 0 ? (
          <p className="text-gray-500 text-sm">No documents added yet</p>
        ) : (
          <div className="space-y-2">
            {recentDocs.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <code className="text-sm font-mono truncate">{doc}</code>
                </div>
                <button
                  onClick={() => removeFromList(doc)}
                  className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Allowed Extensions */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold mb-2">Allowed File Extensions</h3>
        <p className="text-sm text-gray-700 mb-2">
          For security, only files with these extensions are allowed:
        </p>
        <div className="flex flex-wrap gap-2">
          {['.pdf', '.doc', '.docx', '.txt', '.rtf', '.xlsx', '.xls', '.csv',
            '.pptx', '.ppt', '.png', '.jpg', '.jpeg', '.gif', '.svg'].map((ext) => (
              <span
                key={ext}
                className="px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded"
              >
                {ext}
              </span>
            ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Enter an absolute path to an existing file</li>
          <li>The file must have one of the allowed extensions</li>
          <li>Click &ldquo;Add to Recent Documents&rdquo; to register it</li>
          <li>Check your OS recent documents/files menu to see it listed</li>
          <li>Click &ldquo;Clear All&rdquo; to remove all recent documents</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-yellow-300">
          <p className="text-xs text-gray-700">
            <strong>Where to Find:</strong><br />
            • <strong>macOS:</strong> Apple menu → Recent Items → Documents<br />
            • <strong>Windows:</strong> File Explorer → Quick Access → Recent or Jump List (right-click taskbar icon)<br />
            • <strong>Linux:</strong> File manager recent files section (varies by desktop environment)
          </p>
        </div>
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-700">
            <strong>Note:</strong> The file must actually exist on your system.
            The demo sample paths will only work if those files exist on your computer.
            Try creating a test file first or use an existing file path.
          </p>
        </div>
      </div>
    </div>
  );
}
