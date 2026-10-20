import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({
  className,
  orientation = 'horizontal',
  ...props
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <hr
        aria-orientation="vertical"
        className={cn('h-full min-h-6 w-px border-0 bg-border', className)}
        {...props}
      />
    );
  }

  return <hr className={cn('h-px w-full border-0 bg-border', className)} {...props} />;
}
