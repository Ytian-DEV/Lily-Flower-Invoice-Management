import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Skeleton } from '@/components/ui/Feedback';
import { cn } from '@/utils/cn';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  to?: string;
  isLoading?: boolean;
}

export function StatCard({ hint, icon, isLoading, label, to, value }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        {icon ? <span className="text-subtle [&_svg]:size-4">{icon}</span> : null}
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-7 w-28" />
      ) : (
        <p className="mt-2 font-heading text-[1.625rem] leading-tight font-medium tracking-tight text-text tabular-nums">
          {value}
        </p>
      )}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </>
  );

  const classes = 'block rounded-xl border border-border bg-surface p-4 shadow-card';

  return to ? (
    <Link
      to={to}
      className={cn(
        classes,
        'transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none',
      )}
    >
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
