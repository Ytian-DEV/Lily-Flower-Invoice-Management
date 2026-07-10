import { CalendarDays, CreditCard, FileClock, Package, Users } from 'lucide-react';

import { StatCard } from '@/components/ui';
import type { DashboardStat } from '@/features/dashboard/services/dashboardAnalytics';

interface StatsGridProps {
  isLoading?: boolean;
  stats?: DashboardStat[];
}

const statIcons = [
  CalendarDays,
  FileClock,
  FileClock,
  CreditCard,
  CreditCard,
  Users,
  Package,
  FileClock,
  CreditCard,
  CreditCard,
  FileClock,
  Package,
  Package,
  CalendarDays,
  CreditCard,
  FileClock,
];

export function StatsGrid({ isLoading = false, stats = [] }: StatsGridProps) {
  const displayStats =
    stats.length > 0
      ? stats
      : Array.from({ length: 16 }, (_, index) => ({
          title: `Metric ${index + 1}`,
          value: '',
          description: '',
        }));

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {displayStats.map((stat, index) => {
        const Icon = statIcons[index] ?? FileClock;

        return (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={<Icon aria-hidden="true" className="size-5" />}
            trend="neutral"
            isLoading={isLoading}
          />
        );
      })}
    </section>
  );
}
