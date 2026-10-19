import type { KeyboardEvent, ReactNode } from 'react';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export type TabsVariant = 'underline' | 'pills' | 'contained';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  variant?: TabsVariant;
  ariaLabel?: string;
}

const variantClasses: Record<TabsVariant, string> = {
  underline: 'border-b border-border',
  pills: 'gap-2',
  contained: 'rounded-xl border border-border bg-surface p-1 shadow-soft',
};

export function Tabs({
  ariaLabel = 'Tabs',
  items,
  onValueChange,
  value,
  variant = 'underline',
}: TabsProps) {
  const enabledItems = items.filter((item) => !item.disabled);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = enabledItems.findIndex((item) => item.id === value);
    if (currentIndex < 0) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex =
        (currentIndex + direction + enabledItems.length) % enabledItems.length;
      onValueChange(enabledItems[nextIndex].id);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex overflow-x-auto', variantClasses[variant])}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => {
        const isActive = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => onValueChange(item.id)}
            className={cn(
              'inline-flex min-h-11 shrink-0 items-center gap-2 px-4 text-sm font-semibold text-muted transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50',
              variant === 'underline' &&
                isActive &&
                'border-b-2 border-primary text-primary-dark',
              variant === 'pills' && 'rounded-full',
              variant === 'pills' && isActive && 'bg-accent text-primary-dark',
              variant === 'contained' && 'rounded-lg',
              variant === 'contained' && isActive && 'bg-accent text-primary-dark',
            )}
          >
            {item.icon}
            {item.label}
            {item.badge ? <Badge variant="info">{item.badge}</Badge> : null}
          </button>
        );
      })}
    </div>
  );
}
