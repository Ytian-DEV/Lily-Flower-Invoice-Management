import { describe, expect, it } from 'vitest';

import { normalizePhoneNumber } from '@/features/customers/utils';
import { toIlikePattern } from '@/lib/search';
import { formatDate } from '@/utils/formatDate';
import { formatPhone } from '@/utils/formatPhone';

describe('toIlikePattern', () => {
  it('wraps a term for a contains search', () => {
    expect(toIlikePattern('  Ana  Cruz ')).toBe('%Ana Cruz%');
  });

  it('strips characters that would break a PostgREST or() filter', () => {
    expect(toIlikePattern('a,b)(c."d%_e\\')).toBe('%a b c d e%');
  });

  it('returns null when nothing searchable is left', () => {
    expect(toIlikePattern(' ,() ')).toBeNull();
  });
});

describe('phone numbers', () => {
  it('stores mobile numbers as +63', () => {
    expect(normalizePhoneNumber('0917 123 4567')).toBe('+639171234567');
    expect(normalizePhoneNumber('639171234567')).toBe('+639171234567');
    expect(normalizePhoneNumber('+639171234567')).toBe('+639171234567');
  });

  it('shows mobile numbers the local way', () => {
    expect(formatPhone('+639171234567')).toBe('0917 123 4567');
    expect(formatPhone('09171234567')).toBe('0917 123 4567');
    expect(formatPhone('(053) 335 1234')).toBe('(053) 335 1234');
    expect(formatPhone(null)).toBe('');
  });
});

describe('formatDate', () => {
  it('never shifts a calendar date across time zones', () => {
    expect(formatDate('2026-10-24', 'yyyy-MM-dd')).toBe('2026-10-24');
    expect(formatDate('2026-01-01', 'MMM d, yyyy')).toBe('Jan 1, 2026');
  });
});
