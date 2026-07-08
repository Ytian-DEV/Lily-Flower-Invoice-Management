interface LogoPlaceholderProps {
  size?: 'sm' | 'md';
}

export function LogoPlaceholder({ size = 'md' }: LogoPlaceholderProps) {
  const sizeClass = size === 'sm' ? 'size-11 text-[0.48rem]' : 'size-14 text-[0.56rem]';

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-background p-2 text-center font-semibold leading-tight text-muted`}
    >
      LOGO PLACEHOLDER
    </div>
  );
}
