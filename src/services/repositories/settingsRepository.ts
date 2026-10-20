import { supabase } from '@/lib/supabase';
import type { TableInsert, TableUpdate } from '@/types/database';

export const settingsRepository = {
  create(payload: TableInsert<'settings'>) {
    return supabase.from('settings').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'settings'>) {
    return supabase.from('settings').update(payload).eq('id', id).select('*').single();
  },
  getActive() {
    return supabase
      .from('settings')
      .select('*')
      .order('created_at')
      .limit(1)
      .maybeSingle();
  },
};
