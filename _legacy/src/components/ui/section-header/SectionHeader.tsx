import type { ReactNode } from 'react';

import { Divider } from '@/components/ui/Divider';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  showDivider?: boolean;
}

export function SectionHeader({
  actions,
  description,
  showDivider = true,
  title,
}: SectionHeaderProps) {
  return (
    <header>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-text">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {showDivider ? <Divider className="mt-5" /> : null}
    </header>
  );
}
