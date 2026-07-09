import { useNavigate } from 'react-router';

import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState, ErrorState, KeyValueDisplay, Skeleton } from '@/components/ui';
import {
  DashboardCharts,
  DashboardHeader,
  DashboardListCard,
  QuickActions,
  RecentInvoicesTable,
  StatsGrid,
  useDashboardAnalytics,
} from '@/features/dashboard';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, error, isLoading, refresh } = useDashboardAnalytics();

  if (error && !data) {
    return (
      <PageContainer>
        <ErrorState
          title="Dashboard analytics could not load"
          description={error}
          onRetry={refresh}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <DashboardHeader onActionClick={navigate} />
        <QuickActions />
        <StatsGrid stats={data?.stats} isLoading={isLoading} />
        {error ? (
          <ErrorState title="Live refresh failed" description={error} onRetry={refresh} />
        ) : null}
        <DashboardListCard
          title="Analytics"
          description="Live order, revenue, product, and payment performance."
        >
          {isLoading && !data ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-52" />
              ))}
            </div>
          ) : data ? (
            <DashboardCharts
              revenueThisMonth={data.revenueThisMonth}
              ordersByStatus={data.ordersByStatus}
              topSellingProducts={data.topSellingProducts}
              monthlySalesTrend={data.monthlySalesTrend}
            />
          ) : null}
        </DashboardListCard>
        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardListCard
            title="Recent Orders"
            description="Latest invoices created in the system."
          >
            {data?.recentOrders.length ? (
              <RecentInvoicesTable
                invoices={data.recentOrders}
                onViewInvoice={(invoiceId) => navigate(`/orders/${invoiceId}`)}
              />
            ) : (
              <EmptyState
                title="No recent orders"
                description="New invoices will appear here once orders are created."
              />
            )}
          </DashboardListCard>
          <DashboardListCard
            title="Recent Payments"
            description="Latest payments received from customers."
          >
            {data?.recentPayments.length ? (
              <KeyValueDisplay items={data.recentPayments} />
            ) : (
              <EmptyState
                title="No recent payments"
                description="Payments will appear here once recorded."
              />
            )}
          </DashboardListCard>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardListCard
            title="Pending Payments"
            description="Invoices with outstanding balances."
          >
            {data?.pendingPayments.length ? (
              <KeyValueDisplay items={data.pendingPayments} />
            ) : (
              <EmptyState
                title="No pending payments"
                description="Outstanding balances are clear."
              />
            )}
          </DashboardListCard>
          <DashboardListCard
            title="Upcoming Deliveries"
            description="Scheduled deliveries in the next seven days."
          >
            {data?.upcomingDeliveries.length ? (
              <KeyValueDisplay items={data.upcomingDeliveries} />
            ) : (
              <EmptyState
                title="No upcoming deliveries"
                description="Scheduled deliveries will appear here."
              />
            )}
          </DashboardListCard>
        </div>
      </div>
    </PageContainer>
  );
}
