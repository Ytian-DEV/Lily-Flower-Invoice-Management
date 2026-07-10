import { useState } from 'react';

interface LogoPlaceholderProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LogoPlaceholder({ size = 'md' }: LogoPlaceholderProps) {
  const sizeClass =
    size === 'sm'
      ? 'size-11 text-[0.48rem]'
      : size === 'lg'
        ? 'size-16 text-[0.62rem]'
        : 'size-14 text-[0.56rem]';
  const [hasLogoError, setHasLogoError] = useState(false);

  if (!hasLogoError) {
    return (
      <img
        src="/images/lily-logo.png"
        alt="Lily Flowers logo"
        className={`${sizeClass} shrink-0 rounded-xl border border-border bg-background object-contain p-1`}
        onError={() => setHasLogoError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-background p-2 text-center font-semibold leading-tight text-muted`}
    >
      LOGO PLACEHOLDER
    </div>
  );
}
