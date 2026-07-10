import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

export interface ErrorStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  illustration?: ReactNode;
  errorCode?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export function ErrorState({
  description,
  errorCode,
  icon,
  illustration,
  onGoBack,
  onRetry,
  title,
}: ErrorStateProps) {
  return (
    <Card variant="elevated">
      <CardBody className="flex flex-col items-center py-12 text-center">
        {illustration ?? (
          <div className="flex size-16 items-center justify-center rounded-full bg-accent text-primary-dark">
            {icon ?? <AlertTriangle aria-hidden="true" className="size-7" />}
          </div>
        )}
        {errorCode ? (
          <p className="mt-5 text-sm font-semibold text-primary-dark">{errorCode}</p>
        ) : null}
        <h2 className="mt-2 font-heading text-2xl font-semibold text-text">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
        ) : null}
        {onRetry || onGoBack ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {onRetry ? <Button onClick={onRetry}>Retry</Button> : null}
            {onGoBack ? (
              <Button variant="outline" onClick={onGoBack}>
                Go Back
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
