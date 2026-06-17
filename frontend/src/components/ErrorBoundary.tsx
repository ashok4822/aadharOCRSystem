import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error captured by ErrorBoundary:', error, errorInfo);
    // You could send this error to Sentry or another logging service here
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card glass-panel">
            <div className="error-boundary-icon-wrapper">
              <ShieldAlert size={48} className="error-boundary-icon" />
            </div>
            <h1 className="error-boundary-title">Application Error</h1>
            <p className="error-boundary-description">
              An unexpected error occurred in the application. Try reloading the page to restore functionality.
            </p>
            {this.state.error && (
              <pre className="error-boundary-details">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="btn-cyan-glow error-boundary-btn"
              style={{ padding: '0.85rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem auto 0 auto', border: 'none' }}
            >
              <RotateCcw size={18} />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
