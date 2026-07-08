import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';

export function ProductsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Products"
        description="This page will be implemented in a future volume."
      />
      <div className="mt-8 rounded-xl border border-border bg-surface p-8 shadow-soft" />
    </PageContainer>
  );
}
