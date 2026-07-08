import type { ImgHTMLAttributes } from 'react';
import { User } from 'lucide-react';

import { cn } from '@/utils/cn';

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-14 text-base',
};

function getInitials(name?: string) {
  if (!name) {
    return '';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Avatar({
  alt,
  className,
  name,
  size = 'md',
  src,
  ...props
}: AvatarProps) {
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? name ?? 'Avatar'}
        className={cn(
          'rounded-full object-cover ring-1 ring-border',
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-primary-dark ring-1 ring-border',
        sizeClasses[size],
        className,
      )}
      aria-label={name ? `${name} avatar` : 'Avatar placeholder'}
    >
      {initials || <User aria-hidden="true" className="size-5" />}
    </span>
  );
}
