import { format } from 'date-fns';

export const SHOP_TIME_ZONE = 'Asia/Manila';

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Date-only strings (YYYY-MM-DD) are calendar dates, not instants; parse them as
 * local midnight so they never shift a day in another time zone.
 */
function toDate(value: Date | string) {
  if (typeof value === 'string' && dateOnlyPattern.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
}

export function formatDate(date: Date | string, pattern = 'MMM d, yyyy') {
  return format(toDate(date), pattern);
}

/** Today's date in the shop's time zone, as YYYY-MM-DD. */
export function manilaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIME_ZONE }).format(
    new Date(),
  );
}

export function shiftDate(isoDate: string, days: number) {
  const date = toDate(isoDate);
  date.setDate(date.getDate() + days);
  return format(date, 'yyyy-MM-dd');
}

/** "Today", "Tomorrow", weekday names for the coming week, then a short date. */
export function formatRelativeDay(isoDate: string | null) {
  if (!isoDate) {
    return 'No date';
  }

  const today = manilaToday();
  const difference = Math.round(
    (toDate(isoDate).getTime() - toDate(today).getTime()) / 86_400_000,
  );

  if (difference === 0) return 'Today';
  if (difference === 1) return 'Tomorrow';
  if (difference === -1) return 'Yesterday';
  if (difference > 1 && difference < 7) return format(toDate(isoDate), 'EEEE');

  return formatDate(isoDate, 'MMM d');
}
