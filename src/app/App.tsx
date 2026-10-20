import { QueryClientProvider } from '@tanstack/react-query';

import { ErrorBoundary } from '@/components/error';
import { ToastProvider } from '@/components/ui';
import { AuthProvider } from '@/features/auth';
import { queryClient } from '@/lib/queryClient';
import { AppRouterProvider } from '@/providers/AppRouterProvider';

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <AppRouterProvider />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
