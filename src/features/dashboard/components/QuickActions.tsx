import { useNavigate } from 'react-router';

import { Card, CardBody, SectionHeader } from '@/components/ui';
import { dashboardQuickActions } from '@/mocks/dashboard';

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Quick Actions"
        description="Shortcuts for common workflows."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardQuickActions.map((action) => (
          <button
            key={action.path}
            type="button"
            className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => navigate(action.path)}
          >
            <Card variant="elevated" className="h-full transition hover:border-primary">
              <CardBody>
                <action.icon aria-hidden="true" className="size-6 text-primary" />
                <p className="mt-4 font-semibold text-text">{action.label}</p>
              </CardBody>
            </Card>
          </button>
        ))}
      </div>
    </section>
  );
}
