import type { KeyboardEvent } from 'react';

import { cn } from '@/utils/cn';

export interface TabItem<TValue extends string> {
  value: TValue;
  label: string;
  count?: number;
}

export interface TabsProps<TValue extends string> {
  items: TabItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  label: string;
  className?: string;
}

export function Tabs<TValue extends string>({
  className,
  items,
  label,
  onChange,
  value,
}: TabsProps<TValue>) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }

    event.preventDefault();
    const index = items.findIndex((item) => item.value === value);
    const next =
      items[
        (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length
      ];
    onChange(next.value);
    event.currentTarget
      .querySelector<HTMLElement>(`[data-value="${next.value}"]`)
      ?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            data-value={item.value}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              '-mb-px inline-flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              isActive
                ? 'border-primary text-text'
                : 'border-transparent text-muted hover:text-text',
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <span className="rounded-full bg-black/[0.05] px-1.5 text-xs tabular-nums text-muted">
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
