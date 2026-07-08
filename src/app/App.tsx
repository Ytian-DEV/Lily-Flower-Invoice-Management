import { AppRouterProvider } from '@/providers/AppRouterProvider';
import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRouterProvider />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
