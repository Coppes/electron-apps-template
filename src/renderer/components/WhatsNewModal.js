import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Sparkle, ArrowRight } from '@phosphor-icons/react';
import Button from './ui/Button';
const WhatsNewModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [version, setVersion] = useState('');
    useEffect(() => {
        const check = async () => {
            try {
                if (window.electronAPI?.store) {
                    const pending = await window.electronAPI.store.get('pendingWhatsNew');
                    if (pending) {
                        setVersion(pending);
                        setIsOpen(true);
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
        };
        check();
    }, []);
    const handleClose = async () => {
        setIsOpen(false);
        if (window.electronAPI?.store) {
            await window.electronAPI.store.delete('pendingWhatsNew');
        }
    };
    return (_jsx(Dialog.Root, { open: isOpen, onOpenChange: handleClose, children: _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "fixed inset-0 bg-black/50 z-50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), _jsx(Dialog.Content, { "aria-describedby": undefined, className: "fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkle, { className: "w-6 h-6 text-yellow-500" }), _jsxs(Dialog.Title, { className: "text-xl font-bold", children: ["What's New in v", version] })] }), _jsxs("div", { className: "space-y-3 text-sm text-foreground/80", children: [_jsxs("div", { className: "bg-muted/30 p-3 rounded-md", children: [_jsxs("h4", { className: "font-semibold mb-1 flex items-center gap-2", children: [_jsx(ArrowRight, { className: "w-3 h-3" }), " Multi-Window Support"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "You can now tear out tabs into their own windows for true multitasking." })] }), _jsxs("div", { className: "bg-muted/30 p-3 rounded-md", children: [_jsxs("h4", { className: "font-semibold mb-1 flex items-center gap-2", children: [_jsx(ArrowRight, { className: "w-3 h-3" }), " Custom Themes"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Personalize the app with your own color schemes." })] }), _jsxs("div", { className: "bg-muted/30 p-3 rounded-md", children: [_jsxs("h4", { className: "font-semibold mb-1 flex items-center gap-2", children: [_jsx(ArrowRight, { className: "w-3 h-3" }), " Sound Feedback"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Enjoy subtle audio cues for a more responsive feel." })] })] }), _jsx("div", { className: "flex justify-end mt-2", children: _jsx(Button, { onClick: handleClose, children: "Got it!" }) })] }) })] }) }));
};
export default WhatsNewModal;
