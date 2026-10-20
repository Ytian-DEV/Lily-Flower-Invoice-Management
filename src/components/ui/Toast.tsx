import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

import { cn } from '@/utils/cn';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastItem extends Required<Omit<ToastOptions, 'description'>> {
  id: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: <CheckCircle2 aria-hidden="true" className="size-4 text-success" />,
  error: <AlertCircle aria-hidden="true" className="size-4 text-danger" />,
  info: <Info aria-hidden="true" className="size-4 text-info" />,
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ description, title, variant = 'info' }: ToastOptions) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current.slice(-2), { id, title, description, variant }]);
      window.setTimeout(() => dismiss(id), variant === 'error' ? 7000 : 4000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[60] grid w-[min(22rem,calc(100vw-2rem))] gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex animate-fade-in gap-3 rounded-lg border border-border bg-surface p-3 shadow-popover',
            )}
          >
            <span className="mt-0.5">{icons[toast.variant]}</span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-text">{toast.title}</p>
              {toast.description ? (
                <p className="mt-0.5 text-muted">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              className="self-start rounded p-0.5 text-subtle hover:text-text"
              onClick={() => dismiss(toast.id)}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.');
  }

  return context;
}
