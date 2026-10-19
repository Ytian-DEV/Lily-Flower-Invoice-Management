import type { ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export interface FilterPanelProps {
  title?: string;
  children: ReactNode;
  isCollapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  onApply?: () => void;
  onReset?: () => void;
}

export function FilterPanel({
  children,
  isCollapsible = false,
  isOpen = true,
  onApply,
  onReset,
  onToggle,
  title = 'Filters',
}: FilterPanelProps) {
  return (
    <Card variant="outlined">
      <CardHeader className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden="true" className="size-5 text-primary" />
          <h2 className="font-heading text-lg font-semibold text-text">{title}</h2>
        </div>
        {isCollapsible ? (
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {isOpen ? 'Hide' : 'Show'}
          </Button>
        ) : null}
      </CardHeader>
      {isOpen ? (
        <CardBody>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onReset}>
              Reset
            </Button>
            <Button onClick={onApply}>Apply Filters</Button>
          </div>
        </CardBody>
      ) : null}
    </Card>
  );
}
