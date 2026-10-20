import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

import { controlClasses } from '@/components/ui/styles';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/utils/cn';

export interface SearchInputProps {
  value: string;
  /** Called with the debounced value, so typing does not fire a request per key. */
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  delay?: number;
}

export function SearchInput({
  className,
  delay = 300,
  label = 'Search',
  onChange,
  placeholder = 'Search',
  value,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebouncedValue(draft, delay);

  useEffect(() => {
    if (debounced !== value) {
      onChange(debounced);
    }
    // Only react to the debounced draft, not to parent re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    setDraft((current) => (current === value ? current : value));
  }, [value]);

  return (
    <div className={cn('relative w-full sm:max-w-xs', className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
      />
      <input
        type="search"
        aria-label={label}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        className={cn(
          controlClasses,
          'h-10 pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden',
        )}
      />
      {draft ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setDraft('');
            onChange('');
          }}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-subtle hover:text-text"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
