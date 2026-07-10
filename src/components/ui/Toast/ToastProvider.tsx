import { X } from 'lucide-react';
import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';

import { Alert, type AlertVariant } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
  ToastContext,
  type Toast,
  type ToastOptions,
  type ToastPosition,
  type ToastVariant,
} from '@/components/ui/Toast/toastContext';
import { cn } from '@/utils/cn';

export interface ToastProviderProps extends PropsWithChildren {
  position?: ToastPosition;
}

const positionClasses: Record<ToastPosition, string> = {
  'top-right': 'right-4 top-4',
  'top-left': 'left-4 top-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'left-1/2 top-4 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

const alertVariant: Record<ToastVariant, AlertVariant> = {
  success: 'success',
  warning: 'warning',
  info: 'info',
  error: 'error',
};

export function ToastProvider({ children, position = 'top-right' }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      description = '',
      duration = 5000,
      title = '',
      variant = 'info',
      action,
    }: ToastOptions) => {
      const id = crypto.randomUUID();
      const toast: Toast = { id, title, description, duration, variant, action };

      setToasts((current) => [...current, toast]);

      if (duration > 0) {
        window.setTimeout(() => dismissToast(id), duration);
      }

      return id;
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({ dismissToast, showToast, toasts }),
    [dismissToast, showToast, toasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={cn(
          'fixed z-[60] grid w-[min(24rem,calc(100vw-2rem))] gap-3',
          positionClasses[position],
        )}
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="relative transition duration-300">
            <Alert
              variant={alertVariant[toast.variant]}
              title={toast.title}
              description={toast.description}
              actions={toast.action}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
