import type { PropsWithChildren } from 'react';

import { cn } from '@/utils/cn';

export function PageContainer({
  children,
  className,
  size = 'default',
}: PropsWithChildren<{ className?: string; size?: 'default' | 'narrow' }>) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8',
        size === 'narrow' ? 'max-w-4xl' : 'max-w-6xl',
        className,
      )}
    >
      {children}
    </div>
  );
}
