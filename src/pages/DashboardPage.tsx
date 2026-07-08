import { useNavigate } from 'react-router';

import { PageContainer } from '@/components/layout/PageContainer';
import { KeyValueDisplay, Timeline } from '@/components/ui';
import {
  DashboardHeader,
  DashboardListCard,
  QuickActions,
  RecentInvoicesTable,
  StatsGrid,
} from '@/features/dashboard';
import {
  pendingPayments,
  recentActivity,
  systemOverview,
  upcomingDeliveries,
} from '@/mocks/dashboard';

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="space-y-8">
        <DashboardHeader onActionClick={navigate} />
        <QuickActions />
        <StatsGrid />
        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardListCard
            title="Recent Activity"
            description="Prepared for invoice, payment, and status events."
          >
            <Timeline
              items={recentActivity.map((item) => ({
                id: item.id,
                date: item.date,
                title: item.title,
                description: item.description,
              }))}
            />
          </DashboardListCard>
          <DashboardListCard
            title="System Overview"
            description="High-level system readiness placeholders."
          >
            <KeyValueDisplay items={systemOverview} columns={2} />
          </DashboardListCard>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardListCard
            title="Pending Payments"
            description="Payment reminders will appear here later."
          >
            <KeyValueDisplay
              items={pendingPayments.map(({ label, value }) => ({ label, value }))}
            />
          </DashboardListCard>
          <DashboardListCard
            title="Upcoming Deliveries"
            description="Delivery schedule will appear here later."
          >
            <KeyValueDisplay
              items={upcomingDeliveries.map(({ label, value }) => ({ label, value }))}
            />
          </DashboardListCard>
        </div>
        <DashboardListCard
          title="Recent Invoices"
          description="This table is wired to placeholder data and ready for Supabase queries."
        >
          <RecentInvoicesTable />
        </DashboardListCard>
      </div>
    </PageContainer>
  );
}
