import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, Check, RocketLaunch, Shield, Stack, Keyboard } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
const Onboarding = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const { t } = useTranslation('onboarding');
    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const completed = await window.electronAPI.store.get('onboardingCompleted');
                const legacyCompleted = await window.electronAPI.store.get('hasCompletedTour');
                if (!completed && !legacyCompleted) {
                    setIsOpen(true);
                }
                else if (!completed && legacyCompleted) {
                    // Migration: set new key if old key exists
                    await window.electronAPI.store.set('onboardingCompleted', true);
                }
            }
            catch (error) {
                // console.error('Failed to check onboarding status:', error);
            }
        };
        // Check if triggered manually via event or props could be added later
        // For now, checks store on mount
        checkOnboarding();
        // Listen for manual trigger (e.g. from Help menu)
        const handleManualTrigger = () => {
            setIsOpen(true);
            setStep(0);
        };
        window.addEventListener('open-onboarding', handleManualTrigger);
        // Listen for menu actions (IPC)
        let cleanupMenuListener;
        if (window.electronAPI?.events?.onMenuAction) {
            cleanupMenuListener = window.electronAPI.events.onMenuAction((action) => {
                if (action === 'show-onboarding') {
                    handleManualTrigger();
                }
            });
        }
        return () => {
            window.removeEventListener('open-onboarding', handleManualTrigger);
            if (cleanupMenuListener)
                cleanupMenuListener();
        };
    }, []);
    const handleComplete = async () => {
        try {
            await window.electronAPI.store.set('onboardingCompleted', true);
            setIsOpen(false);
        }
        catch (error) {
            // console.error('Failed to save onboarding status:', error);
            setIsOpen(false); // Close anyway
        }
    };
    const [platform, setPlatform] = useState('unknown');
    useEffect(() => {
        const getPlatform = async () => {
            try {
                const p = await window.electronAPI.system.getPlatform();
                setPlatform(p.platform);
            }
            catch (e) {
                // console.error('Failed to get platform', e);
            }
        };
        getPlatform();
    }, []);
    const modKey = platform === 'darwin' ? 'Cmd' : 'Ctrl';
    const steps = [
        {
            title: t('steps.welcome.title', 'Welcome to Electron App'),
            description: t('steps.welcome.description', 'A powerful, secure, and modern template for your next project.'),
            icon: _jsx(RocketLaunch, { className: "w-16 h-16 text-white" }),
            gradient: "from-blue-500 to-purple-500"
        },
        {
            title: t('steps.security.title', 'Secure by Default'),
            description: t('steps.security.description', 'Built with context isolation, sandbox enabled, and strict CSP.'),
            icon: _jsx(Shield, { className: "w-16 h-16 text-white" }),
            gradient: "from-green-500 to-teal-500"
        },
        {
            title: t('steps.features.title', 'Feature Rich'),
            description: t('steps.features.description', 'Includes Tabs, Command Palette, i18n, and more out of the box.'),
            icon: _jsx(Stack, { className: "w-16 h-16 text-white" }),
            gradient: "from-orange-500 to-red-500"
        },
        {
            title: t('steps.shortcuts.title', 'Keyboard Shortcuts'),
            description: t('steps.shortcuts.description', 'Boost your productivity with built-in shortcuts ({{mod}}+K) and command palette ({{mod}}+Shift+P).', { mod: modKey }),
            icon: _jsx(Keyboard, { className: "w-16 h-16 text-white" }),
            gradient: "from-pink-500 to-rose-500"
        },
    ];
    if (!isOpen)
        return null;
    return (_jsx(Dialog.Root, { open: isOpen, onOpenChange: setIsOpen, children: _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "fixed inset-0 bg-black/50 z-50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), _jsxs(Dialog.Content, { className: "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", children: [_jsxs("div", { className: "flex flex-col gap-6 text-center pt-4", children: [_jsx("div", { className: `w-full h-40 bg-gradient-to-r ${steps[step].gradient} rounded-lg flex items-center justify-center shadow-inner`, children: steps[step].icon }), _jsxs("div", { className: "space-y-2", children: [_jsx(Dialog.Title, { className: "text-2xl font-bold tracking-tight", children: steps[step].title }), _jsx(Dialog.Description, { className: "text-muted-foreground text-lg", children: steps[step].description })] })] }), _jsxs("div", { className: "flex flex-col gap-6 mt-4", children: [_jsx("div", { className: "flex justify-center gap-2", children: steps.map((_, i) => (_jsx("div", { className: `h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-muted'}` }, i))) }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Button, { variant: "ghost", onClick: handleComplete, children: t('buttons.skip', 'Skip') }), _jsxs("div", { className: "flex gap-2", children: [step > 0 && (_jsx(Button, { variant: "outline", onClick: () => setStep(step - 1), children: t('buttons.back', 'Back') })), step < steps.length - 1 ? (_jsxs(Button, { onClick: () => setStep(step + 1), children: [t('buttons.next', 'Next'), " ", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] })) : (_jsxs(Button, { onClick: handleComplete, children: [t('buttons.finish', 'Get Started'), " ", _jsx(Check, { className: "ml-2 h-4 w-4" })] }))] })] })] })] })] }) }));
};
export default Onboarding;
