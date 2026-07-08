import { supabase } from '@/lib/supabase';
import type { TableInsert, TableUpdate } from '@/types/database';

export interface CustomerQuery {
  search?: string;
  recentlyAdded?: boolean;
  page?: number;
  pageSize?: number;
}

export const customersRepository = {
  list() {
    return supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
  },
  getById(id: string) {
    return supabase.from('customers').select('*').eq('id', id).single();
  },
  create(payload: TableInsert<'customers'>) {
    return supabase.from('customers').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'customers'>) {
    return supabase.from('customers').update(payload).eq('id', id).select('*').single();
  },
  remove(id: string) {
    return supabase.from('customers').delete().eq('id', id);
  },
  search(query: string) {
    return supabase
      .from('customers')
      .select('*')
      .or(
        `full_name.ilike.%${query}%,phone_number.ilike.%${query}%,delivery_address.ilike.%${query}%`,
      )
      .order('created_at', { ascending: false });
  },
  query({ page = 1, pageSize = 10, recentlyAdded, search }: CustomerQuery) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let request = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      request = request.or(
        `full_name.ilike.%${search}%,phone_number.ilike.%${search}%,delivery_address.ilike.%${search}%`,
      );
    }

    if (recentlyAdded) {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      request = request.gte('created_at', since.toISOString());
    }

    return request;
  },
  countInvoices(customerId: string) {
    return supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId);
  },
};
