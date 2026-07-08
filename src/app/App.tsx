import { AppRouterProvider } from '@/providers/AppRouterProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRouterProvider />
      </ToastProvider>
    </ThemeProvider>
  );
}
