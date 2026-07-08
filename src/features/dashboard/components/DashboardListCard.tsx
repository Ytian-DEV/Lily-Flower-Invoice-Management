import type { ReactNode } from 'react';

import { Card, CardBody, SectionHeader } from '@/components/ui';

interface DashboardListCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DashboardListCard({
  children,
  description,
  title,
}: DashboardListCardProps) {
  return (
    <Card variant="elevated">
      <CardBody>
        <SectionHeader title={title} description={description} showDivider={false} />
        <div className="mt-5">{children}</div>
      </CardBody>
    </Card>
  );
}
