import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { File, FloppyDisk, Gear, Book, UploadSimple } from '@phosphor-icons/react';
import { useTab } from '../hooks/useTab';
import DropZone from '../components/features/data-management/DropZone';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
const HomePage = () => {
    const { t } = useTranslation('common');
    const [droppedFiles, setDroppedFiles] = useState([]);
    const { openTab } = useTab();
    const handleDrop = async (files) => {
        setDroppedFiles(files);
        // console.log('Dropped files:', files);
        // Auto-import logic could go here, or just showing them
        for (const file of files) {
            if (file.path) {
                // Example: check extension and import if supported
                if (file.path.endsWith('.json') || file.path.endsWith('.csv')) {
                    try {
                        // We could automatically trigger import here or just notify
                        // console.log('File supported for import:', file.path);
                    }
                    catch (e) {
                        // console.error('Import check failed', e);
                    }
                }
            }
        }
    };
    const handleDragError = (_error) => {
        // console.error('Drag and drop error:', error);
    };
    const handleOpenFile = async () => {
        try {
            const filePath = await window.electronAPI.dialog.showOpenDialog({
                properties: ['openFile']
            });
            if (filePath) {
                // console.log('Selected file:', filePath);
                // Handle file opening logic
            }
        }
        catch (error) {
            // console.error('Open file error:', error);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-background p-8 flex flex-col items-center justify-center", children: _jsx("div", { className: "w-full max-w-4xl space-y-8", children: _jsxs("div", { className: "text-center space-y-2", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("h1", { className: "text-4xl font-bold tracking-tight", children: t('app.name') }), _jsx("p", { className: "text-xl text-muted-foreground", children: t('app.subtitle') })] }), _jsx(DropZone, { onDrop: handleDrop, onError: handleDragError, className: "w-full", activeClassName: "ring-4 ring-primary ring-opacity-50 bg-accent", children: _jsx(Card, { className: "border-dashed border-2 min-h-[300px] flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors", children: _jsxs(CardContent, { className: "flex flex-col items-center space-y-4 p-8 text-center", children: [_jsx("div", { className: "p-4 rounded-full bg-primary/10 text-primary mb-2", children: _jsx(UploadSimple, { className: "w-12 h-12" }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-2xl font-semibold", children: t('home.drop_title') }), _jsx("p", { className: "text-muted-foreground max-w-sm", children: t('home.drop_desc') })] }), _jsxs("div", { className: "flex gap-4 mt-4", children: [_jsx(Button, { onClick: (e) => { e.stopPropagation(); handleOpenFile(); }, children: t('home.open_file') }), _jsx(Button, { variant: "outline", onClick: (e) => { e.stopPropagation(); openTab({ id: 'settings', title: t('nav.items.settings'), type: 'settings' }); }, children: t('nav.items.settings') })] })] }) }) }), droppedFiles.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('home.recent_activity') }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: droppedFiles.map((file, idx) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-muted rounded-md", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(File, { className: "w-6 h-6" }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-medium", children: file.name }), _jsx("span", { className: "text-xs text-muted-foreground", children: file.path })] })] }), _jsx("span", { className: "text-xs text-muted-foreground", children: t('home.just_now') })] }, idx))) }) })] })), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs(Button, { variant: "ghost", className: "h-24 flex flex-col gap-2", onClick: () => openTab({ id: 'backup', title: t('nav.items.backups'), type: 'backup' }), children: [_jsx(FloppyDisk, { className: "w-8 h-8" }), t('home.backups')] }), _jsxs(Button, { variant: "ghost", className: "h-24 flex flex-col gap-2", onClick: () => openTab({ id: 'settings', title: t('nav.items.settings'), type: 'settings' }), children: [_jsx(Gear, { className: "w-8 h-8" }), t('home.settings')] }), _jsxs(Button, { variant: "ghost", className: "h-24 flex flex-col gap-2", onClick: () => window.open('https://github.com', '_blank'), children: [_jsx(Book, { className: "w-8 h-8" }), t('home.docs')] })] })] }) }) }));
};
export default HomePage;
