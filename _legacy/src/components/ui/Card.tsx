import type { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '@/utils/cn';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'border border-border bg-surface',
  elevated: 'border border-border bg-surface shadow-soft',
  outlined: 'border border-border bg-transparent',
};

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div className={cn('rounded-xl', variantClasses[variant], className)} {...props} />
  );
}

export function CardHeader({
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('border-b border-border p-5', className)} {...props} />;
}

export function CardBody({
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('border-t border-border p-5', className)} {...props} />;
}
