import { supabase } from '@/lib/supabase';
import type { TableInsert, TableUpdate } from '@/types/database';

export const addonsRepository = {
  create(payload: TableInsert<'addons'>) {
    return supabase.from('addons').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'addons'>) {
    return supabase.from('addons').update(payload).eq('id', id).select('*').single();
  },
};
