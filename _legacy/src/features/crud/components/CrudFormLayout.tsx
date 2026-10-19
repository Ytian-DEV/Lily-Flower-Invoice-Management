import type { ReactNode } from 'react';

import { Alert, Card, CardBody, SectionHeader } from '@/components/ui';

export interface CrudFormLayoutProps {
  title: string;
  description?: string;
  validationSummary?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function CrudFormLayout({
  children,
  description,
  footer,
  title,
  validationSummary,
}: CrudFormLayoutProps) {
  return (
    <form className="space-y-6">
      <SectionHeader title={title} description={description} />
      {validationSummary ? (
        <Alert
          variant="error"
          title="Please review the form"
          description={validationSummary}
        />
      ) : null}
      <Card variant="elevated">
        <CardBody>
          <div className="grid gap-5 md:grid-cols-2">{children}</div>
        </CardBody>
      </Card>
      {footer}
    </form>
  );
}
