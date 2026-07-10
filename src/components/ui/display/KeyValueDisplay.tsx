import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export interface KeyValueItem {
  label: string;
  value: ReactNode;
}

export interface KeyValueDisplayProps {
  items: KeyValueItem[];
  columns?: 1 | 2 | 3;
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
};

export function KeyValueDisplay({ columns = 2, items }: KeyValueDisplayProps) {
  return (
    <dl className={cn('grid gap-4', columnClasses[columns])}>
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-sm font-medium text-muted">{item.label}</dt>
          <dd className="mt-1 text-sm font-semibold text-text">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
