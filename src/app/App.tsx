import { AppRouterProvider } from '@/providers/AppRouterProvider';
import { ErrorBoundary } from '@/components/error';
import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRouterProvider />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
