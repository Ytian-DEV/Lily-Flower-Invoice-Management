import { EmptyState } from '@/components/ui';
import type { DashboardChartItem } from '@/features/dashboard/services/dashboardAnalytics';
import { cn } from '@/utils/cn';

interface DashboardChartsProps {
  revenueThisMonth: DashboardChartItem[];
  ordersByStatus: DashboardChartItem[];
  topSellingProducts: DashboardChartItem[];
  monthlySalesTrend: DashboardChartItem[];
}

interface BarChartProps {
  items: DashboardChartItem[];
  tone?: 'primary' | 'success' | 'warning';
}

function BarChart({ items, tone = 'primary' }: BarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 0);

  if (items.length === 0 || max === 0) {
    return (
      <EmptyState
        title="No chart data yet"
        description="New invoices and payments will appear here automatically."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const width = Math.max((item.value / max) * 100, 4);

        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-text">{item.label}</span>
              <span className="shrink-0 text-muted">
                {item.displayValue ?? item.value}
              </span>
            </div>
            <div
              className="h-2 rounded-full bg-border"
              aria-label={`${item.label}: ${item.displayValue ?? item.value}`}
            >
              <div
                className={cn(
                  'h-2 rounded-full',
                  tone === 'success' && 'bg-success-text',
                  tone === 'warning' && 'bg-warning-text',
                  tone === 'primary' && 'bg-primary',
                )}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendChart({ items }: { items: DashboardChartItem[] }) {
  const max = Math.max(...items.map((item) => item.value), 0);

  return (
    <div
      className="flex h-48 items-end gap-3"
      role="img"
      aria-label="Monthly sales trend"
    >
      {items.map((item) => {
        const height = max > 0 ? Math.max((item.value / max) * 100, 8) : 8;

        return (
          <div
            key={item.label}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-32 w-full items-end rounded-md bg-border/60 px-1">
              <div
                className="w-full rounded-t bg-primary"
                style={{ height: `${height}%` }}
                title={`${item.label}: ${item.displayValue ?? item.value}`}
              />
            </div>
            <span className="text-xs font-medium text-muted">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardCharts({
  monthlySalesTrend,
  ordersByStatus,
  revenueThisMonth,
  topSellingProducts,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section>
        <h2 className="font-heading text-lg font-semibold text-text">
          Revenue This Month
        </h2>
        <div className="mt-4">
          <BarChart items={revenueThisMonth} tone="success" />
        </div>
      </section>
      <section>
        <h2 className="font-heading text-lg font-semibold text-text">Orders by Status</h2>
        <div className="mt-4">
          <BarChart items={ordersByStatus} tone="primary" />
        </div>
      </section>
      <section>
        <h2 className="font-heading text-lg font-semibold text-text">
          Top Selling Products
        </h2>
        <div className="mt-4">
          <BarChart items={topSellingProducts} tone="warning" />
        </div>
      </section>
      <section>
        <h2 className="font-heading text-lg font-semibold text-text">
          Monthly Sales Trend
        </h2>
        <TrendChart items={monthlySalesTrend} />
      </section>
    </div>
  );
}
