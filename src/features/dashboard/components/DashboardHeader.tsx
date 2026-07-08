import { format } from 'date-fns';

import { Button } from '@/components/ui';
import { useAuth } from '@/features/auth';

interface DashboardHeaderProps {
  onActionClick: (path: string) => void;
}

export function DashboardHeader({ onActionClick }: DashboardHeaderProps) {
  const { profile } = useAuth();

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-soft">
      <p className="text-sm font-medium text-primary-dark">
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </p>
      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-text">
            Welcome, {profile?.full_name ?? 'Lily Flowers Team'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Lily Flowers - Baybay City Branch dashboard is ready for live business data.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => onActionClick('/invoices/new')}>Generate Invoice</Button>
          <Button variant="outline" onClick={() => onActionClick('/history')}>
            View History
          </Button>
        </div>
      </div>
    </section>
  );
}
