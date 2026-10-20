import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-card hover:bg-primary-dark',
  secondary:
    'border border-border-strong bg-surface text-text shadow-card hover:bg-surface-muted',
  ghost: 'text-muted hover:bg-black/[0.04] hover:text-text',
  danger: 'bg-danger text-white shadow-card hover:bg-danger-text',
  soft: 'bg-primary-soft text-primary-dark hover:bg-primary-soft/70',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[0.8125rem]',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-5 text-sm',
  icon: 'size-9',
};

export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function buttonClasses({
  className,
  fullWidth = false,
  size = 'md',
  variant = 'primary',
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50',
    focusRing,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  );
}

export const controlClasses =
  'w-full rounded-lg border border-border-strong bg-surface text-sm text-text shadow-[inset_0_1px_1px_rgb(34_27_30/0.03)] transition-colors placeholder:text-subtle hover:border-subtle focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15';

export function fieldDescriptionId(id?: string) {
  return id ? `${id}-description` : undefined;
}
