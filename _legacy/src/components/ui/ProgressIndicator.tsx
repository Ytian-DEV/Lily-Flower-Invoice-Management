import { cn } from '@/utils/cn';

export interface ProgressIndicatorProps {
  value?: number;
  variant?: 'linear' | 'circular';
  isIndeterminate?: boolean;
  label?: string;
}

export function ProgressIndicator({
  isIndeterminate = false,
  label,
  value = 0,
  variant = 'linear',
}: ProgressIndicatorProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  if (variant === 'circular') {
    return (
      <div
        className="inline-grid place-items-center gap-2"
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : normalizedValue}
      >
        <div
          className={cn(
            'size-12 rounded-full border-4 border-accent border-t-primary',
            isIndeterminate && 'animate-spin',
          )}
        />
        {label ? <span className="text-sm text-muted">{label}</span> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {label ? <span className="text-sm font-medium text-text">{label}</span> : null}
      {isIndeterminate ? (
        <div
          className="h-3 overflow-hidden rounded-full bg-accent"
          role="progressbar"
          aria-label={label}
        >
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
      ) : (
        <progress
          className="h-3 w-full overflow-hidden rounded-full accent-primary"
          value={normalizedValue}
          max={100}
          aria-label={label}
        />
      )}
    </div>
  );
}
