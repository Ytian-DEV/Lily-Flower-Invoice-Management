const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const compactPesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number) {
  return pesoFormatter.format(Number(value) || 0);
}

/** ₱12.5K style, for chart labels where space is tight. */
export function formatCompactCurrency(value: number) {
  return compactPesoFormatter.format(Number(value) || 0);
}
