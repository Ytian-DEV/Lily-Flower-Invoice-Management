export const colorTokens = {
  primary: '#F4378A',
  primaryDark: '#D91F6D',
  secondary: '#FF73B3',
  accent: '#FDE4EF',
  background: '#FFF9FB',
  surface: '#FFFFFF',
  border: '#F5C2D8',
  text: '#2D2D2D',
  muted: '#7D7D7D',
  success: '#2F8F5B',
  warning: '#B7791F',
  danger: '#C2414B',
  info: '#356FA8',
} as const;

export const typography = {
  display: 'font-heading text-5xl font-semibold leading-tight',
  h1: 'font-heading text-4xl font-semibold leading-tight',
  h2: 'font-heading text-3xl font-semibold leading-tight',
  h3: 'font-heading text-2xl font-semibold leading-snug',
  h4: 'font-heading text-xl font-semibold leading-snug',
  bodyLarge: 'font-body text-lg leading-8',
  body: 'font-body text-base leading-7',
  bodySmall: 'font-body text-sm leading-6',
  caption: 'font-body text-xs leading-5',
  label: 'font-body text-sm font-semibold leading-5',
} as const;

export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

export const radius = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
} as const;

export const shadows = {
  sm: '0 8px 24px rgb(244 55 138 / 0.06)',
  md: '0 14px 35px rgb(244 55 138 / 0.09)',
  lg: '0 22px 55px rgb(244 55 138 / 0.12)',
  xl: '0 30px 80px rgb(244 55 138 / 0.14)',
} as const;

export const animation = {
  fast: 'duration-150',
  base: 'duration-200',
  slow: 'duration-300',
  easing: 'ease-out',
} as const;

export const iconSizes = {
  xs: 'size-4',
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-8',
} as const;

export const layout = {
  contentMaxWidth: 'max-w-6xl',
  pagePadding: 'px-4 py-8 sm:px-6 lg:px-8',
  sectionGap: 'space-y-8',
  gridGap: 'gap-4',
  sidebarWidth: 'w-72',
  navbarHeight: 'min-h-14',
} as const;

export type ColorToken = keyof typeof colorTokens;
export type TypographyToken = keyof typeof typography;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type ShadowToken = keyof typeof shadows;
