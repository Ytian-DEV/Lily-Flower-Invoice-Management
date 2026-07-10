import type { ReactNode } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';

export interface EmptyTableProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  illustration?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}

export function EmptyTable({
  description = 'There are no records to display yet.',
  title = 'No data found',
  ...props
}: EmptyTableProps) {
  return <EmptyState title={title} description={description} {...props} />;
}
