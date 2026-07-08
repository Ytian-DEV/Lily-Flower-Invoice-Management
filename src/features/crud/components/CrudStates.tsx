import { Button, EmptyState, ErrorState, Skeleton } from '@/components/ui';

export interface CrudEmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function CrudEmptyState({
  actionLabel,
  description,
  onAction,
  title,
}: CrudEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      primaryAction={
        actionLabel && onAction ? (
          <Button onClick={onAction}>{actionLabel}</Button>
        ) : undefined
      }
    />
  );
}

export function CrudLoadingState() {
  return (
    <div className="grid gap-4">
      <Skeleton variant="card" />
      <Skeleton variant="table-row" />
      <Skeleton variant="table-row" />
      <Skeleton variant="table-row" />
    </div>
  );
}

export interface CrudErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export function CrudErrorState({
  description,
  onGoBack,
  onRetry,
  title = 'Unable to load records',
}: CrudErrorStateProps) {
  return (
    <ErrorState
      title={title}
      description={description}
      onRetry={onRetry}
      onGoBack={onGoBack}
    />
  );
}
