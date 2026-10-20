import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'table-row' | 'avatar';
}

const variantClasses = {
  text: 'h-4 w-full rounded-md',
  card: 'h-36 w-full rounded-xl',
  'table-row': 'h-12 w-full rounded-xl',
  avatar: 'size-11 rounded-full',
};

export function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-accent/70', variantClasses[variant], className)}
      aria-hidden="true"
      {...props}
    />
  );
}
