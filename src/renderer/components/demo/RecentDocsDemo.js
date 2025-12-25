import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        }
        catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };
    const clearDocuments = async () => {
        try {
            await window.electronAPI.recentDocs.clear();
            setRecentDocs([]);
            setStatus('Recent documents cleared');
        }
        catch (error) {
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Clock, { className: "w-6 h-6 text-indigo-600" }), _jsx("h2", { className: "text-2xl font-bold", children: "Recent Documents" })] }), status && (_jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2", children: [_jsx(WarningCircle, { className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-sm text-blue-800", children: status })] })), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-3", children: "Add Document to Recent List" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "File Path" }), _jsx("input", { type: "text", value: filePath, onChange: (e) => setFilePath(e.target.value), placeholder: "/path/to/document.pdf", className: "w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Enter an absolute path to a file (Note: File must exist and have allowed extension)" })] }), _jsxs("button", { onClick: addDocument, className: "w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add to Recent Documents"] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium mb-2", children: "Sample Paths (Click to use):" }), _jsx("div", { className: "space-y-1", children: samplePaths.map((path, index) => (_jsx("button", { onClick: () => addSampleDoc(path), className: "w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded font-mono", children: path }, index))) })] })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h3", { className: "font-semibold", children: ["Added Documents (", recentDocs.length, ")"] }), recentDocs.length > 0 && (_jsxs("button", { onClick: clearDocuments, className: "px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1", children: [_jsx(Trash, { className: "w-3 h-3" }), "Clear All"] }))] }), recentDocs.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No documents added yet" })) : (_jsx("div", { className: "space-y-2", children: recentDocs.map((doc, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [_jsx(FileText, { className: "w-4 h-4 text-gray-600 flex-shrink-0" }), _jsx("code", { className: "text-sm font-mono truncate", children: doc })] }), _jsx("button", { onClick: () => removeFromList(doc), className: "text-red-600 hover:text-red-800 ml-2 flex-shrink-0", children: _jsx(Trash, { className: "w-4 h-4" }) })] }, index))) }))] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4 bg-gray-50", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Allowed File Extensions" }), _jsx("p", { className: "text-sm text-gray-700 mb-2", children: "For security, only files with these extensions are allowed:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.xlsx', '.xls', '.csv',
                            '.pptx', '.ppt', '.png', '.jpg', '.jpeg', '.gif', '.svg'].map((ext) => (_jsx("span", { className: "px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded", children: ext }, ext))) })] }), _jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Instructions:" }), _jsxs("ol", { className: "list-decimal list-inside space-y-1 text-sm", children: [_jsx("li", { children: "Enter an absolute path to an existing file" }), _jsx("li", { children: "The file must have one of the allowed extensions" }), _jsx("li", { children: "Click \u201CAdd to Recent Documents\u201D to register it" }), _jsx("li", { children: "Check your OS recent documents/files menu to see it listed" }), _jsx("li", { children: "Click \u201CClear All\u201D to remove all recent documents" })] }), _jsx("div", { className: "mt-3 pt-3 border-t border-yellow-300", children: _jsxs("p", { className: "text-xs text-gray-700", children: [_jsx("strong", { children: "Where to Find:" }), _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "macOS:" }), " Apple menu \u2192 Recent Items \u2192 Documents", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "Windows:" }), " File Explorer \u2192 Quick Access \u2192 Recent or Jump List (right-click taskbar icon)", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "Linux:" }), " File manager recent files section (varies by desktop environment)"] }) }), _jsx("div", { className: "mt-2 p-2 bg-red-50 border border-red-200 rounded", children: _jsxs("p", { className: "text-xs text-red-700", children: [_jsx("strong", { children: "Note:" }), " The file must actually exist on your system. The demo sample paths will only work if those files exist on your computer. Try creating a test file first or use an existing file path."] }) })] })] }));
}
