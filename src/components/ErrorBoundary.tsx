import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error inside component tree:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[320px] p-6 rounded-2xl bg-slate-900/80 border border-red-500/30 flex flex-col items-center justify-center text-center space-y-4 text-slate-200">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-white">
              {this.props.fallbackTitle || 'Display Interruption'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {this.state.error?.message || 'A component encountered an issue rendering. You can reload this view.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
