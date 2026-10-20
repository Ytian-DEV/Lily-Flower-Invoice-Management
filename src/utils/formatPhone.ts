/** +639171234567 → 0917 123 4567, the way numbers are written locally. */
export function formatPhone(value: string | null | undefined) {
  if (!value) {
    return '';
  }

  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('63') ? `0${digits.slice(2)}` : digits;

  if (/^09\d{9}$/.test(local)) {
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }

  return value;
}
