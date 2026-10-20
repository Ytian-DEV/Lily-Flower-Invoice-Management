import { useEffect, useId, useRef, useState } from 'react';
import { Search, UserRound, X } from 'lucide-react';

import { Spinner } from '@/components/ui';
import { controlClasses } from '@/components/ui/styles';
import { useCustomerLookup } from '@/features/customers/api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/utils/cn';
import { formatPhone } from '@/utils/formatPhone';

export interface PickedCustomer {
  id: string;
  full_name: string;
  phone_number: string;
  delivery_address: string | null;
  notes: string | null;
}

interface CustomerPickerProps {
  selectedName: string | null;
  onSelect: (customer: PickedCustomer) => void;
  onClear: () => void;
}

/** Search-as-you-type customer lookup; scales to any number of customers. */
export function CustomerPicker({ onClear, onSelect, selectedName }: CustomerPickerProps) {
  const [term, setTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounced = useDebouncedValue(term, 250);
  const lookup = useCustomerLookup(debounced);
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const results = lookup.data ?? [];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => setActiveIndex(0), [debounced]);

  if (selectedName) {
    return (
      <div className="flex h-10 items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary-soft/50 px-3 text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <UserRound aria-hidden="true" className="size-4 shrink-0 text-primary-dark" />
          <span className="truncate font-medium text-text">{selectedName}</span>
          <span className="text-xs text-muted">saved customer</span>
        </span>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-text"
        >
          <X aria-hidden="true" className="size-3.5" /> Change
        </button>
      </div>
    );
  }

  const choose = (customer: PickedCustomer) => {
    onSelect(customer);
    setTerm('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
      />
      <input
        type="text"
        role="combobox"
        aria-label="Find a saved customer"
        aria-expanded={isOpen && term.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        value={term}
        placeholder="Search saved customers"
        onChange={(event) => {
          setTerm(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, results.length - 1));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          } else if (event.key === 'Enter' && results[activeIndex]) {
            event.preventDefault();
            choose(results[activeIndex]);
          } else if (event.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        className={cn(controlClasses, 'h-10 pr-9 pl-9')}
      />
      {lookup.isFetching ? (
        <Spinner size="sm" className="absolute top-3 right-3 text-subtle" />
      ) : null}
      {isOpen && term.trim() ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-popover"
        >
          {results.length === 0 && !lookup.isFetching ? (
            <li className="px-3 py-2 text-sm text-muted">
              No saved customer found. Fill in the details below.
            </li>
          ) : null}
          {results.map((customer, index) => (
            <li
              key={customer.id}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(customer)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                'cursor-pointer rounded-md px-3 py-2 text-sm',
                index === activeIndex && 'bg-surface-muted',
              )}
            >
              <p className="font-medium text-text">{customer.full_name}</p>
              <p className="text-xs text-muted tabular-nums">
                {formatPhone(customer.phone_number)}
                {customer.delivery_address ? ` · ${customer.delivery_address}` : ''}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
