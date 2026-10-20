import { Search, X } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface SearchBarProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
}

export function SearchBar({
  debounceMs = 300,
  defaultValue = '',
  isLoading = false,
  onChange,
  onSearch,
  placeholder = 'Search...',
  value,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => onSearch?.(currentValue), debounceMs);
    return () => window.clearTimeout(timeoutId);
  }, [currentValue, debounceMs, onSearch]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const clearSearch = () => {
    setInternalValue('');
    onChange?.('');
    onSearch?.('');
  };

  return (
    <div className="relative w-full sm:max-w-sm">
      <Input
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        leadingIcon={<Search aria-hidden="true" className="size-5" />}
        trailingIcon={isLoading ? undefined : null}
        aria-label={placeholder}
      />
      {currentValue ? (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 min-h-10 px-3"
          aria-label="Clear search"
          onClick={clearSearch}
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
