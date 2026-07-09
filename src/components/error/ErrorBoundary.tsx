import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';

import { Button, Card, CardBody } from '@/components/ui';
import { LogoPlaceholder } from '@/components/layout/LogoPlaceholder';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error boundary caught an error.', {
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="min-h-screen bg-background px-4 py-10 text-text">
        <Card variant="elevated" className="mx-auto max-w-xl">
          <CardBody className="flex flex-col items-center py-12 text-center">
            <LogoPlaceholder />
            <p className="mt-6 text-sm font-semibold text-primary-dark">Runtime Error</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold">
              Something went wrong
            </h1>
            <p className="mt-3 max-w-md text-sm text-muted">
              The app hit an unexpected issue. Reloading usually restores the current
              workflow.
            </p>
            <Button
              className="mt-6"
              leftIcon={<RotateCcw className="size-4" />}
              onClick={this.handleReload}
            >
              Reload App
            </Button>
          </CardBody>
        </Card>
      </main>
    );
  }
}
