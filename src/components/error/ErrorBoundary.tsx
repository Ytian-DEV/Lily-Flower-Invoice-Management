import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Last-resort boundary; it avoids depending on providers that may have failed. */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error', error, errorInfo.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <h1 className="font-heading text-2xl font-medium text-text">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-muted">
            Reload the page to continue. Saved orders are not affected.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 h-10 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Reload
          </button>
        </div>
      </main>
    );
  }
}
