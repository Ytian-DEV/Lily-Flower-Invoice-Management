import { supabase } from '@/lib/supabase';
import type { ProductAvailability, TableInsert, TableUpdate } from '@/types/database';

export interface ProductCatalogQuery {
  search?: string;
  categoryId?: string;
  availability?: ProductAvailability;
  page?: number;
  pageSize?: number;
}

export const productCategoriesRepository = {
  list() {
    return supabase.from('product_categories').select('*').order('sort_order');
  },
  create(payload: TableInsert<'product_categories'>) {
    return supabase.from('product_categories').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'product_categories'>) {
    return supabase
      .from('product_categories')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
  },
  remove(id: string) {
    return supabase.from('product_categories').delete().eq('id', id);
  },
};

export const productsRepository = {
  list() {
    return supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
  },
  getById(id: string) {
    return supabase.from('products').select('*').eq('id', id).single();
  },
  create(payload: TableInsert<'products'>) {
    return supabase.from('products').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'products'>) {
    return supabase.from('products').update(payload).eq('id', id).select('*').single();
  },
  remove(id: string) {
    return supabase.from('products').delete().eq('id', id);
  },
  listAvailable() {
    return supabase
      .from('products')
      .select('*')
      .eq('availability', 'available')
      .order('product_name', { ascending: true });
  },
  search(query: string) {
    return supabase
      .from('products')
      .select('*')
      .ilike('product_name', `%${query}%`)
      .order('product_name', { ascending: true });
  },
  query({
    availability,
    categoryId,
    page = 1,
    pageSize = 10,
    search,
  }: ProductCatalogQuery) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let request = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('product_name', { ascending: true })
      .range(from, to);

    if (search) {
      request = request.ilike('product_name', `%${search}%`);
    }

    if (categoryId) {
      request = request.eq('category_id', categoryId);
    }

    if (availability) {
      request = request.eq('availability', availability);
    }

    return request;
  },
};
