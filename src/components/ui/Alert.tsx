import type { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

import { cn } from '@/utils/cn';

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

const variantClasses: Record<AlertVariant, string> = {
  success: 'border-success-ring bg-success-bg text-success-text',
  warning: 'border-warning-ring bg-warning-bg text-warning-text',
  error: 'border-danger-ring bg-danger-bg text-danger-text',
  info: 'border-info-ring bg-info-bg text-info-text',
};

const icons: Record<AlertVariant, ReactNode> = {
  success: <CheckCircle2 aria-hidden="true" className="size-4" />,
  warning: <AlertTriangle aria-hidden="true" className="size-4" />,
  error: <AlertCircle aria-hidden="true" className="size-4" />,
  info: <Info aria-hidden="true" className="size-4" />,
};

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Alert({
  actions,
  className,
  description,
  title,
  variant = 'info',
}: AlertProps) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border px-4 py-3',
        variantClasses[variant],
        className,
      )}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <span className="mt-0.5 shrink-0">{icons[variant]}</span>
      <div className="min-w-0 flex-1 text-sm">
        {title ? <p className="font-medium">{title}</p> : null}
        {description ? (
          <div className={cn(title && 'mt-0.5', 'opacity-90')}>{description}</div>
        ) : null}
      </div>
      {actions ? <div className="shrink-0 self-center">{actions}</div> : null}
    </div>
  );
}
