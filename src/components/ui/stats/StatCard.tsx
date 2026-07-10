import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

export interface StatCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: string;
  isLoading?: boolean;
  chart?: ReactNode;
  onClick?: () => void;
}

export function StatCard({
  chart,
  description,
  icon,
  isLoading = false,
  onClick,
  percentage,
  title,
  trend = 'neutral',
  value,
}: StatCardProps) {
  const TrendIcon = trend === 'down' ? TrendingDown : TrendingUp;

  return (
    <Card
      variant="elevated"
      className={cn(
        onClick &&
          'cursor-pointer transition hover:-translate-y-0.5 hover:border-primary',
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardBody>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">{title}</p>
            {isLoading ? (
              <Skeleton className="mt-3 h-8 w-28" />
            ) : (
              <p className="mt-2 font-heading text-3xl font-semibold text-text">
                {value}
              </p>
            )}
          </div>
          {icon ? (
            <div className="rounded-xl bg-accent p-3 text-primary-dark">{icon}</div>
          ) : null}
        </div>
        {description ? <p className="mt-3 text-sm text-muted">{description}</p> : null}
        {percentage ? (
          <p
            className={cn(
              'mt-3 inline-flex items-center gap-1 text-sm font-semibold',
              trend === 'down' ? 'text-danger-text' : 'text-success-text',
            )}
          >
            <TrendIcon aria-hidden="true" className="size-4" />
            {percentage}
          </p>
        ) : null}
        {chart ? <div className="mt-4">{chart}</div> : null}
      </CardBody>
    </Card>
  );
}
