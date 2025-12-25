import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle, AlertDescription } from '../ui/Alert';
import Button from '../ui/Button';
/**
 * Error Boundary Component
 * Catches JavaScript errors in the React component tree and displays a fallback UI
 *
 * Security features:
 * - Prevents error information leakage in production
 * - Reports errors to main process for logging
 * - Provides user-friendly error messages
 * - Allows recovery without full app restart
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }
    static getDerivedStateFromError(_error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        // Log error to main process
        this.setState({
            error,
            errorInfo,
        });
        // Report to main process via IPC (if available)
        if (window.electronAPI?.log) {
            window.electronAPI.log.error('React Error Boundary caught error', {
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
            });
        }
        // Fallback: error is logged to main process error handler via console
    }
    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };
    handleReload = () => {
        window.location.reload();
    };
    render() {
        if (this.state.hasError) {
            const { fallback } = this.props;
            // Use custom fallback if provided
            if (fallback) {
                return fallback;
            }
            // Default error UI
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-background", children: _jsx("div", { className: "max-w-2xl w-full", children: _jsxs(Alert, { variant: "error", children: [_jsx(AlertTitle, { className: "text-lg font-semibold mb-2", children: "Something went wrong" }), _jsxs(AlertDescription, { children: [_jsx("p", { className: "mb-4", children: "An unexpected error occurred in the application. This error has been logged and you can try to recover using one of the options below." }), process.env.NODE_ENV === 'development' && this.state.error && (_jsxs("details", { className: "mb-4 p-3 bg-muted rounded text-xs", children: [_jsx("summary", { className: "cursor-pointer font-semibold mb-2", children: "Error Details (Development Only)" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("strong", { children: "Error:" }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap break-words", children: this.state.error.toString() })] }), this.state.error.stack && (_jsxs("div", { children: [_jsx("strong", { children: "Stack Trace:" }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap break-words text-xs", children: this.state.error.stack })] })), this.state.errorInfo?.componentStack && (_jsxs("div", { children: [_jsx("strong", { children: "Component Stack:" }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap break-words text-xs", children: this.state.errorInfo.componentStack })] }))] })] })), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: this.handleReset, size: "sm", children: "Try Again" }), _jsx(Button, { onClick: this.handleReload, variant: "outline", size: "sm", children: "Reload Application" })] })] })] }) }) }));
        }
        return this.props.children;
    }
}
ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
};
export default ErrorBoundary;
