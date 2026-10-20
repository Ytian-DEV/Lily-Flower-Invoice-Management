import { cn } from '@/utils/cn';

export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src="/images/logo-96.webp"
      alt=""
      width={36}
      height={36}
      decoding="async"
      className={cn('size-9 shrink-0 rounded-lg', className)}
    />
  );
}

export function BrandMark({ subtitle = 'Baybay City' }: { subtitle?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <BrandLogo />
      <div className="min-w-0 leading-tight">
        <p className="truncate font-heading text-[1.0625rem] font-medium text-text">
          Lily Flowers
        </p>
        <p className="truncate text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
