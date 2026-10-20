import { useMemo, useState } from 'react';

export function useSearch(initialValue = '') {
  const [query, setQuery] = useState(initialValue);

  return useMemo(
    () => ({
      query,
      setQuery,
      clearSearch: () => setQuery(''),
      hasQuery: query.trim().length > 0,
    }),
    [query],
  );
}
