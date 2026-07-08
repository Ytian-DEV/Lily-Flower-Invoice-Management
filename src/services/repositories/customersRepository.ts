import { supabase } from '@/lib/supabase';
import type { TableInsert, TableUpdate } from '@/types/database';

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
      .or(`full_name.ilike.%${query}%,phone_number.ilike.%${query}%`)
      .order('created_at', { ascending: false });
  },
};
