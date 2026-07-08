import { supabase } from '@/lib/supabase';
import type { TableInsert, TableUpdate } from '@/types/database';

export const addonsRepository = {
  list() {
    return supabase.from('addons').select('*').order('created_at', { ascending: false });
  },
  getById(id: string) {
    return supabase.from('addons').select('*').eq('id', id).single();
  },
  create(payload: TableInsert<'addons'>) {
    return supabase.from('addons').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'addons'>) {
    return supabase.from('addons').update(payload).eq('id', id).select('*').single();
  },
  remove(id: string) {
    return supabase.from('addons').delete().eq('id', id);
  },
  listAvailable() {
    return supabase
      .from('addons')
      .select('*')
      .eq('availability', 'available')
      .order('addon_name', { ascending: true });
  },
};
