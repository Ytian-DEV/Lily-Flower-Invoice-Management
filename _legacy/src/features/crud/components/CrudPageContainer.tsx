import type { ReactNode } from 'react';

import { PageContainer } from '@/components/layout/PageContainer';
import { DataPageHeader } from '@/components/ui';

export interface CrudPageContainerProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  searchSlot?: ReactNode;
  toolbarSlot?: ReactNode;
  filterSlot?: ReactNode;
  tableSlot?: ReactNode;
  paginationSlot?: ReactNode;
  dialogSlot?: ReactNode;
}

export function CrudPageContainer({
  breadcrumbs,
  dialogSlot,
  filterSlot,
  paginationSlot,
  primaryAction,
  searchSlot,
  secondaryAction,
  subtitle,
  tableSlot,
  title,
  toolbarSlot,
}: CrudPageContainerProps) {
  return (
    <PageContainer>
      <div className="space-y-6">
        <DataPageHeader
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
          searchSlot={searchSlot}
        />
        {toolbarSlot}
        {filterSlot}
        {tableSlot}
        {paginationSlot}
        {dialogSlot}
      </div>
    </PageContainer>
  );
}
