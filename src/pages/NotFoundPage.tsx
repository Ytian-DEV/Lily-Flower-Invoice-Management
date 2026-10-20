import { PageContainer } from '@/components/layout/PageContainer';
import { ButtonLink } from '@/components/ui';

export function NotFoundPage() {
  return (
    <PageContainer size="narrow">
      <div className="py-20 text-center">
        <p className="text-sm font-medium text-primary-dark">404</p>
        <h1 className="mt-2 font-heading text-2xl font-medium text-text">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          The link may be old, or the page was moved.
        </p>
        <ButtonLink to="/dashboard" variant="secondary" className="mt-6">
          Back to dashboard
        </ButtonLink>
      </div>
    </PageContainer>
  );
}
