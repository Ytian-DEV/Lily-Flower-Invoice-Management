import { Link } from 'react-router';

import { PageContainer } from '@/components/layout/PageContainer';

export function NotFoundPage() {
  return (
    <PageContainer>
      <section className="rounded-xl border border-border bg-surface p-8 text-center shadow-soft">
        <div className="mx-auto flex size-28 items-center justify-center rounded-full border border-dashed border-border bg-background font-heading text-3xl font-semibold text-primary-dark">
          404
        </div>
        <h1 className="mt-6 font-heading text-3xl font-semibold text-text">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-muted">
          This page may have moved or has not been created yet.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Return to Dashboard
        </Link>
      </section>
    </PageContainer>
  );
}
