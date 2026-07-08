import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export type AlertVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  isClosable?: boolean;
  onClose?: () => void;
}

const variantClasses: Record<AlertVariant, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-border bg-accent text-primary-dark',
  neutral: 'border-border bg-surface text-text',
};

const icons: Record<AlertVariant, ReactNode> = {
  success: <CheckCircle2 aria-hidden="true" className="size-5" />,
  warning: <AlertTriangle aria-hidden="true" className="size-5" />,
  error: <AlertCircle aria-hidden="true" className="size-5" />,
  info: <Info aria-hidden="true" className="size-5" />,
  neutral: <Info aria-hidden="true" className="size-5" />,
};

export function Alert({
  actions,
  description,
  icon,
  isClosable = false,
  onClose,
  title,
  variant = 'neutral',
}: AlertProps) {
  return (
    <div
      className={cn('flex gap-3 rounded-xl border p-4', variantClasses[variant])}
      role="status"
    >
      <span className="mt-0.5 shrink-0">{icon ?? icons[variant]}</span>
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {description ? <p className="mt-1 text-sm opacity-85">{description}</p> : null}
        {actions ? <div className="mt-3">{actions}</div> : null}
      </div>
      {isClosable ? (
        <Button variant="ghost" size="sm" aria-label="Close alert" onClick={onClose}>
          <X aria-hidden="true" className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
