import React from 'react';
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
declare class ErrorBoundary extends React.Component {
    constructor(props: any);
    static getDerivedStateFromError(_error: any): {
        hasError: boolean;
    };
    componentDidCatch(error: any, errorInfo: any): void;
    handleReset: () => void;
    handleReload: () => void;
    render(): any;
}
export default ErrorBoundary;
