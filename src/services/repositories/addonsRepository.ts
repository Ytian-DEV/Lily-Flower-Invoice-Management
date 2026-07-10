import { supabase } from '@/lib/supabase';
import type { ProductAvailability, TableInsert, TableUpdate } from '@/types/database';

export interface AddonCatalogQuery {
  search?: string;
  availability?: ProductAvailability;
  page?: number;
  pageSize?: number;
}

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
  query({ availability, page = 1, pageSize = 10, search }: AddonCatalogQuery) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let request = supabase
      .from('addons')
      .select('*', { count: 'exact' })
      .order('addon_name', { ascending: true })
      .range(from, to);

    if (search) {
      request = request.ilike('addon_name', `%${search}%`);
    }

    if (availability) {
      request = request.eq('availability', availability);
    }

    return request;
  },
};
