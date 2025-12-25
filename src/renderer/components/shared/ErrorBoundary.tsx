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
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-2xl w-full">
            <Alert variant="error">
              <AlertTitle className="text-lg font-semibold mb-2">
                Something went wrong
              </AlertTitle>
              <AlertDescription>
                <p className="mb-4">
                  An unexpected error occurred in the application. This error has been logged
                  and you can try to recover using one of the options below.
                </p>

                {/* Show error details in development only */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-4 p-3 bg-muted rounded text-xs">
                    <summary className="cursor-pointer font-semibold mb-2">
                      Error Details (Development Only)
                    </summary>
                    <div className="space-y-2">
                      <div>
                        <strong>Error:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-words">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong>Stack Trace:</strong>
                          <pre className="mt-1 whitespace-pre-wrap break-words text-xs">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 whitespace-pre-wrap break-words text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex gap-2">
                  <Button onClick={this.handleReset} size="sm">
                    Try Again
                  </Button>
                  <Button onClick={this.handleReload} variant="outline" size="sm">
                    Reload Application
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

export default ErrorBoundary;
