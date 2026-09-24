import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { TriangleAlert, RefreshCw, Home, Copy, Check } from 'lucide-react';
import { logError } from '../../lib/error-logger';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    try {
      logError(
        'ErrorBoundary',
        error.message || 'Unknown error',
        { componentStack: errorInfo.componentStack || '' },
        error,
      );
    } catch {
      // silent
    }
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopy = async () => {
    const { error, errorInfo } = this.state;
    const text = [
      'Error: ' + (error?.message || 'unknown'),
      '',
      'Stack:',
      error?.stack || '—',
      '',
      'Component stack:',
      errorInfo?.componentStack || '—',
      '',
      'User Agent: ' + navigator.userAgent,
      'Time: ' + new Date().toISOString(),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // silent
    }
  };

  render() {
    const { hasError, error, copied } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;

    if (fallback && error) {
      return fallback(error, this.handleReset);
    }

    return (
      <main
        dir="rtl"
        className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-slate-950 dark:to-slate-900"
      >
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
              <TriangleAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-lg">مشکلی پیش آمد</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                متأسفانه خطایی رخ داد. نگران نباشید — داده‌های شما امن است.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-xs font-mono text-slate-600 dark:text-slate-400 max-h-32 overflow-auto" dir="ltr">
            {error?.message || 'Unknown error'}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              تلاش مجدد
            </button>
            <button
              onClick={this.handleReload}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm font-bold rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              بازخوانی صفحه
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={this.handleGoHome}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm rounded-lg"
            >
              <Home className="w-4 h-4" />
              صفحه اصلی
            </button>
            <button
              onClick={this.handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm rounded-lg"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'کپی شد' : 'کپی جزئیات'}
            </button>
          </div>

          <div className="text-[10px] text-slate-400 text-center pt-2 border-t dark:border-slate-800">
            اگر مشکل ادامه دارد، از منوی «تنظیمات → درباره» گزارش دهید
          </div>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
