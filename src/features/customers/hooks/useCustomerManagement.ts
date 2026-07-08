import { useCallback, useEffect, useMemo, useState } from 'react';

import { customersRepository } from '@/services/repositories/customersRepository';
import type { Customer, CustomerFilters } from '@/features/customers/types';

const defaultFilters: CustomerFilters = {
  hasOutstandingBalance: false,
  hasOrders: false,
  recentlyAdded: false,
};

export function useCustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CustomerFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    const { data, error } = await customersRepository.list();

    if (error) {
      setErrorMessage('Unable to load customers. Please try again.');
      setIsLoading(false);
      return;
    }

    setCustomers(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearchQuery(searchInput), 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const recentlyAddedCutoff = new Date();
    recentlyAddedCutoff.setDate(recentlyAddedCutoff.getDate() - 30);

    return customers.filter((customer) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        customer.full_name.toLowerCase().includes(normalizedQuery) ||
        customer.phone_number.toLowerCase().includes(normalizedQuery) ||
        (customer.delivery_address ?? '').toLowerCase().includes(normalizedQuery);
      const matchesRecentlyAdded =
        !filters.recentlyAdded || new Date(customer.created_at) >= recentlyAddedCutoff;

      return matchesSearch && matchesRecentlyAdded;
    });
  }, [customers, filters.recentlyAdded, searchQuery]);

  return {
    customers: filteredCustomers,
    errorMessage,
    filters,
    isLoading,
    refresh: loadCustomers,
    resetFilters: () => setFilters(defaultFilters),
    searchQuery: searchInput,
    setFilters,
    setSearchQuery: setSearchInput,
  };
}
