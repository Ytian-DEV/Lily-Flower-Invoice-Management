import { supabase } from '@/lib/supabase';
import type { TableInsert, TableUpdate } from '@/types/database';

export const customersRepository = {
  create(payload: TableInsert<'customers'>) {
    return supabase.from('customers').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'customers'>) {
    return supabase.from('customers').update(payload).eq('id', id).select('*').single();
  },
  countInvoices(customerId: string) {
    return supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId);
  },
};
