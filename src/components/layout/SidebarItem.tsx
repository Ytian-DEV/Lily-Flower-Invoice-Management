import { NavLink } from 'react-router';

import type { NavigationItem } from '@/routes/navigation';
import { cn } from '@/utils/cn';

interface SidebarItemProps {
  item: NavigationItem;
  onNavigate?: () => void;
}

export function SidebarItem({ item, onNavigate }: SidebarItemProps) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium text-muted transition hover:bg-accent hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          isActive && 'bg-accent text-primary-dark shadow-soft',
        )
      }
    >
      <item.icon aria-hidden="true" className="size-5 shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );
}
