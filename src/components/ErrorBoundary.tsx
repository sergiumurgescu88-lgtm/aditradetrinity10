import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Institutional React Error Boundary Component
 * Isolates runtime exceptions in critical dashboard sections (charts, logs, telemetry)
 * and displays an elegant recovery UI without crashing the entire terminal.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[AM Team Sentinel ErrorBoundary] Uncaught runtime exception:', error, errorInfo);
  }

  public handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full p-6 rounded-xl bg-slate-900/80 border border-amber-500/30 text-slate-200 font-mono flex flex-col items-center justify-center text-center space-y-3 min-h-[220px] shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-amber-400">
              {this.props.title || 'Componentă indisponibilă temporar'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              Modulul a întâmpinat o structură de date neașteptată. Restul terminalului AM Team continuă să ruleze în siguranță.
            </p>
          </div>

          {this.state.error && (
            <div className="text-[11px] px-3 py-1.5 rounded bg-slate-950/80 border border-slate-800 text-slate-400 max-w-sm truncate">
              {this.state.error.message || 'Eroare internă de execuție'}
            </div>
          )}

          <button
            type="button"
            onClick={this.handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reîncearcă inițializarea</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
