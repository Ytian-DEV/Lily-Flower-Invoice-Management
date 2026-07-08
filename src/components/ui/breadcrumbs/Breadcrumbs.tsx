import { ChevronRight, Home } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  maxItems?: number;
}

export function Breadcrumbs({ items, maxItems = 4 }: BreadcrumbsProps) {
  const shouldCollapse = items.length > maxItems;
  const visibleItems = shouldCollapse
    ? [items[0], { label: '...' }, ...items.slice(items.length - (maxItems - 2))]
    : items;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {visibleItems.map((item, index) => {
          const isCurrent = index === visibleItems.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <ChevronRight aria-hidden="true" className="size-4" /> : null}
              {item.href && !isCurrent ? (
                <Link
                  className="inline-flex items-center gap-1 transition hover:text-primary-dark"
                  to={item.href}
                >
                  {item.icon ??
                    (index === 0 ? <Home aria-hidden="true" className="size-4" /> : null)}
                  {item.label}
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-1 text-text"
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.icon}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
