export const componentStyles = {
  focusRing:
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  buttonBase:
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60',
  formField:
    'min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text transition duration-200 ease-out placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-accent/40 disabled:text-muted',
  card: 'rounded-xl border border-border bg-surface shadow-soft',
  tableSurface: 'overflow-hidden rounded-xl border border-border bg-surface shadow-soft',
  modalSurface:
    'relative flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-xl border bg-surface shadow-soft outline-none transition duration-300 ease-out',
} as const;
