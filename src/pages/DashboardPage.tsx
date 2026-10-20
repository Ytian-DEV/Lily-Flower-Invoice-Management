import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Plus,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { PageContainer } from '@/components/layout/PageContainer';
import {
  ButtonLink,
  Card,
  CardHeader,
  DataTable,
  EmptyState,
  ErrorState,
  OrderStatusBadge,
  PageHeader,
  PaymentStateBadge,
  Skeleton,
  StatCard,
  type DataTableColumn,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import {
  useDashboardSummary,
  useRecentOrders,
  useUpcomingDeliveries,
} from '@/features/dashboard/api';
import type { OrderListRow } from '@/features/orders/api';
import { formatCompactCurrency, formatCurrency } from '@/utils/formatCurrency';
import { formatDate, formatRelativeDay, manilaToday } from '@/utils/formatDate';

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: 'Asia/Manila',
    }).format(new Date()),
  );

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function revenueChange(current: number, previous: number) {
  if (previous <= 0) {
    return current > 0 ? 'First payments this period' : 'No payments yet';
  }

  const change = ((current - previous) / previous) * 100;
  const rounded =
    Math.abs(change) < 10 ? change.toFixed(1) : Math.round(change).toString();
  return `${change >= 0 ? '+' : ''}${rounded}% vs last month`;
}

const recentColumns: DataTableColumn<OrderListRow>[] = [
  {
    id: 'invoice',
    header: 'Invoice',
    cell: (row) => (
      <span className="font-medium whitespace-nowrap tabular-nums">
        {row.invoice_number}
      </span>
    ),
  },
  { id: 'customer', header: 'Customer', cell: (row) => row.customer_name },
  {
    id: 'status',
    header: 'Status',
    hideBelow: 'sm',
    cell: (row) => <OrderStatusBadge status={row.status} />,
  },
  {
    id: 'payment',
    header: 'Payment',
    hideBelow: 'md',
    cell: (row) => <PaymentStateBadge state={row.payment_state} />,
  },
  {
    id: 'total',
    header: 'Total',
    align: 'right',
    cell: (row) => (
      <span className="tabular-nums">{formatCurrency(row.total_amount)}</span>
    ),
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const summary = useDashboardSummary();
  const deliveries = useUpcomingDeliveries();
  const recent = useRecentOrders();
  const data = summary.data;
  const firstName = profile?.full_name?.split(' ')[0];
  const maxMonthly = Math.max(
    1,
    ...(data?.monthly_revenue ?? []).map((month) => month.total),
  );

  return (
    <PageContainer>
      <PageHeader
        title={`${greeting()}${firstName ? `, ${firstName}` : ''}`}
        description={formatDate(manilaToday(), 'EEEE, MMMM d')}
        actions={
          <ButtonLink
            to="/orders/new"
            leftIcon={<Plus aria-hidden="true" className="size-4" />}
          >
            New order
          </ButtonLink>
        }
      />

      {summary.isError ? (
        <Card className="mb-6">
          <ErrorState
            title="Dashboard numbers could not load"
            description={summary.error.message}
            onRetry={() => summary.refetch()}
          />
        </Card>
      ) : null}

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Revenue this month"
          icon={<TrendingUp aria-hidden="true" />}
          isLoading={summary.isPending}
          value={formatCurrency(data?.month_revenue ?? 0)}
          hint={
            data ? revenueChange(data.month_revenue, data.previous_month_revenue) : null
          }
          to="/payments?period=month"
        />
        <StatCard
          label="Balance to collect"
          icon={<Wallet aria-hidden="true" />}
          isLoading={summary.isPending}
          value={formatCurrency(data?.outstanding_balance ?? 0)}
          hint={data ? `${data.unpaid_orders} orders with a balance` : null}
          to="/orders?payment=due&sort=balance"
        />
        <StatCard
          label="Open orders"
          icon={<ClipboardList aria-hidden="true" />}
          isLoading={summary.isPending}
          value={data?.open_orders ?? 0}
          hint={data ? `${data.today_orders} new today` : null}
          to="/orders?status=open"
        />
        <StatCard
          label="Deliveries this week"
          icon={<CalendarClock aria-hidden="true" />}
          isLoading={summary.isPending}
          value={data?.deliveries_next_7_days ?? 0}
          hint="Next 7 days"
          to="/orders?status=open&sort=delivery"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Upcoming deliveries"
            description="Open orders due in the next 7 days"
            action={
              <Link
                to="/orders?status=open&sort=delivery"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-dark hover:underline"
              >
                All orders <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            }
          />
          {deliveries.isPending ? (
            <div className="space-y-3 px-5 pb-5">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-12" />
              ))}
            </div>
          ) : deliveries.data?.length ? (
            <ul className="divide-y divide-border border-t border-border">
              {deliveries.data.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                  >
                    <span
                      className={
                        order.delivery_date === manilaToday()
                          ? 'w-16 shrink-0 text-sm font-semibold text-primary-dark sm:w-20'
                          : 'w-16 shrink-0 text-sm font-medium text-text sm:w-20'
                      }
                    >
                      {formatRelativeDay(order.delivery_date)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text">
                        {order.customer_name}
                      </span>
                      <span className="block truncate text-xs text-muted tabular-nums">
                        {order.invoice_number}
                      </span>
                    </span>
                    <span className="hidden sm:block">
                      <OrderStatusBadge status={order.status} />
                    </span>
                    <span className="w-24 text-right text-sm tabular-nums">
                      {order.remaining_balance > 0 ? (
                        <span className="text-warning-text">
                          {formatCurrency(order.remaining_balance)}
                        </span>
                      ) : (
                        <span className="text-success-text">Paid</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<CalendarClock aria-hidden="true" />}
              title="No deliveries this week"
              description="Orders with a delivery date in the next 7 days show up here."
            />
          )}
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader title="Revenue" description="Payments received, last 6 months" />
            <div className="px-5 pb-5">
              {summary.isPending ? (
                <Skeleton className="h-36" />
              ) : (
                <div
                  className="flex h-36 items-end gap-2"
                  role="img"
                  aria-label={(data?.monthly_revenue ?? [])
                    .map((month) => `${month.month}: ${formatCurrency(month.total)}`)
                    .join(', ')}
                >
                  {(data?.monthly_revenue ?? []).map((month, index, months) => {
                    const isCurrent = index === months.length - 1;
                    return (
                      <div
                        key={month.month}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                        title={formatCurrency(month.total)}
                      >
                        <span className="text-[0.6875rem] text-muted tabular-nums">
                          {month.total > 0 ? formatCompactCurrency(month.total) : ''}
                        </span>
                        <div
                          className={
                            isCurrent
                              ? 'w-full rounded-t-md bg-primary'
                              : 'w-full rounded-t-md bg-primary/25'
                          }
                          style={{
                            height: `${Math.max(3, (month.total / maxMonthly) * 100)}%`,
                          }}
                        />
                        <span className="text-xs text-muted">
                          {formatDate(`${month.month}-01`, 'MMM')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Best sellers"
              description="Bouquets ordered, last 90 days"
            />
            <div className="px-5 pb-5">
              {summary.isPending ? (
                <Skeleton className="h-24" />
              ) : data?.top_bouquets.length ? (
                <ol className="space-y-2.5">
                  {data.top_bouquets.map((bouquet, index) => (
                    <li key={bouquet.name} className="flex items-center gap-3 text-sm">
                      <span className="w-4 text-xs text-subtle tabular-nums">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-text">
                        {bouquet.name}
                      </span>
                      <span className="text-muted tabular-nums">{bouquet.quantity}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted">No bouquets sold yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[0.9375rem] font-semibold text-text">Recent orders</h2>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-dark hover:underline"
          >
            View all <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
        <DataTable
          columns={recentColumns}
          rows={recent.data ?? []}
          getRowId={(row) => row.id}
          isLoading={recent.isPending}
          skeletonRows={4}
          onRowClick={(row) => navigate(`/orders/${row.id}`)}
          rowLabel={(row) => `Open ${row.invoice_number}`}
          renderMobileRow={(row) => (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-text">{row.customer_name}</p>
                <p className="text-xs text-muted tabular-nums">{row.invoice_number}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-medium tabular-nums">
                  {formatCurrency(row.total_amount)}
                </span>
                <OrderStatusBadge status={row.status} />
              </div>
            </div>
          )}
          empty={
            <EmptyState
              title="No orders yet"
              description="Your first order will show up here."
              action={<ButtonLink to="/orders/new">Create an order</ButtonLink>}
            />
          }
        />
      </section>
    </PageContainer>
  );
}
