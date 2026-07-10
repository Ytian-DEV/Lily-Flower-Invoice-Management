import { LogoPlaceholder } from '@/components/layout/LogoPlaceholder';
import { SidebarItem } from '@/components/layout/SidebarItem';
import { navigationItems } from '@/routes/navigation';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border bg-surface/95 lg:flex">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <LogoPlaceholder />
        <div>
          <p className="font-heading text-base font-semibold">Lily Flowers</p>
          <p className="text-sm text-muted">Baybay City Branch</p>
        </div>
      </div>
      <nav aria-label="Main navigation" className="grid gap-2 overflow-y-auto p-4">
        {navigationItems.map((item) => (
          <SidebarItem key={item.path} item={item} />
        ))}
      </nav>
    </aside>
  );
}
