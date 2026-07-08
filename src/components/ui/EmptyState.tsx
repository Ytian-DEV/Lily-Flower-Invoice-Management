import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

import { Card, CardBody } from '@/components/ui/Card';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  illustration?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}

export function EmptyState({
  description,
  icon,
  illustration,
  primaryAction,
  secondaryAction,
  title,
}: EmptyStateProps) {
  return (
    <Card variant="elevated">
      <CardBody className="flex flex-col items-center py-12 text-center">
        {illustration ?? (
          <div className="flex size-16 items-center justify-center rounded-full bg-accent text-primary-dark">
            {icon ?? <Inbox aria-hidden="true" className="size-7" />}
          </div>
        )}
        <h2 className="mt-5 font-heading text-2xl font-semibold text-text">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
        ) : null}
        {primaryAction || secondaryAction ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {primaryAction}
            {secondaryAction}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
