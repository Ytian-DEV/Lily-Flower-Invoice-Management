import type { ReactNode } from 'react';

export interface DataPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  searchSlot?: ReactNode;
}

export function DataPageHeader({
  breadcrumbs,
  primaryAction,
  searchSlot,
  secondaryAction,
  subtitle,
  title,
}: DataPageHeaderProps) {
  return (
    <header className="space-y-5">
      {breadcrumbs}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-3xl font-semibold text-text">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>
          ) : null}
        </div>
        {primaryAction || secondaryAction ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {secondaryAction}
            {primaryAction}
          </div>
        ) : null}
      </div>
      {searchSlot}
    </header>
  );
}
