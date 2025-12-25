import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, AlertTitle, AlertDescription } from './Alert';
import { Info, CheckCircle, Warning, XCircle } from '@phosphor-icons/react';
export default {
    title: 'UI/Alert',
    component: Alert,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'info', 'success', 'warning', 'error'],
        },
    },
};
export const Default = {
    render: (args) => (_jsxs(Alert, { ...args, children: [_jsx(Info, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Heads up!" }), _jsx(AlertDescription, { children: "You can add components to your app using the cli." })] })),
    args: {
        variant: 'default',
    },
};
export const InfoAlert = {
    render: (args) => (_jsxs(Alert, { ...args, children: [_jsx(Info, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Note" }), _jsx(AlertDescription, { children: "This is an informational alert." })] })),
    args: {
        variant: 'info',
    },
};
export const Success = {
    render: (args) => (_jsxs(Alert, { ...args, children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Success" }), _jsx(AlertDescription, { children: "Your changes have been saved successfully." })] })),
    args: {
        variant: 'success',
    },
};
export const WarningAlert = {
    render: (args) => (_jsxs(Alert, { ...args, children: [_jsx(Warning, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Warning" }), _jsx(AlertDescription, { children: "Your account is about to expire." })] })),
    args: {
        variant: 'warning',
    },
};
export const ErrorAlert = {
    render: (args) => (_jsxs(Alert, { ...args, children: [_jsx(XCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Error" }), _jsx(AlertDescription, { children: "Something went wrong. Please try again." })] })),
    args: {
        variant: 'error',
    },
};
