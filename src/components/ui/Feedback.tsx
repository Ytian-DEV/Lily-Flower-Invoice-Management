import type { HTMLAttributes, ReactNode } from 'react';
import { AlertCircle, Inbox } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export function Spinner({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        size === 'sm' && 'size-4',
        size === 'md' && 'size-5',
        size === 'lg' && 'size-7',
        className,
      )}
    />
  );
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-black/[0.06]', className)}
      {...props}
    />
  );
}

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary-dark [&_svg]:size-5">
        {icon ?? <Inbox aria-hidden="true" />}
      </div>
      <p className="mt-3 text-sm font-semibold text-text">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  description,
  onRetry,
  title = 'Something went wrong',
}: {
  title?: string;
  description?: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<AlertCircle aria-hidden="true" />}
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    />
  );
}

export function LoadingScreen({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-muted">
      <Spinner className="text-primary" />
      {label}
    </div>
  );
}
