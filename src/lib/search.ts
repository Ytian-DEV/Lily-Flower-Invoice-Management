/**
 * Turns free text into a safe PostgREST `ilike` pattern.
 *
 * Commas, parentheses, dots and quotes are filter syntax inside `.or(...)`, and
 * `%` / `_` / `\` are LIKE wildcards or escapes, so they are dropped.
 */
export function toIlikePattern(term: string) {
  const cleaned = term
    .replace(/[(),.:"'*\\%_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned ? `%${cleaned}%` : null;
}

export function pageRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}
