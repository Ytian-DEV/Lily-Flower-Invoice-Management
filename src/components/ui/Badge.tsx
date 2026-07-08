import type { HTMLAttributes } from 'react';

import { feedbackToneClasses } from '@/design-system';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: feedbackToneClasses.success,
  warning: feedbackToneClasses.warning,
  danger: feedbackToneClasses.danger,
  info: 'bg-accent text-primary-dark ring-border',
  neutral: 'bg-surface text-muted ring-border',
};

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center rounded-full px-3 text-xs font-semibold ring-1',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
