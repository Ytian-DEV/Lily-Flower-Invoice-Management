import { StatCard } from '@/components/ui';
import { dashboardStats } from '@/mocks/dashboard';

export function StatsGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardStats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={<stat.icon aria-hidden="true" className="size-5" />}
          trend="neutral"
        />
      ))}
    </section>
  );
}
