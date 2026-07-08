import type { ReactNode } from 'react';
import { Clock } from 'lucide-react';

import { cn } from '@/utils/cn';

export interface TimelineItem {
  id: string;
  date: string;
  time?: string;
  title: string;
  description?: string;
  status?: ReactNode;
  icon?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {items.map((item, index) => (
        <li key={item.id} className="relative">
          <span
            className={cn(
              'absolute -left-[2.05rem] flex size-8 items-center justify-center rounded-full border border-border bg-surface text-primary-dark shadow-sm',
              index === 0 && 'bg-accent',
            )}
          >
            {item.icon ?? <Clock aria-hidden="true" className="size-4" />}
          </span>
          <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-muted">
                  {item.date}
                  {item.time ? ` at ${item.time}` : ''}
                </p>
                <h3 className="mt-1 font-heading text-lg font-semibold text-text">
                  {item.title}
                </h3>
              </div>
              {item.status}
            </div>
            {item.description ? (
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
