import { supabase } from '@/lib/supabase';
import type { ProductAvailability, TableInsert, TableUpdate } from '@/types/database';
import type { ProductFormValues } from '@/validation';

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

export const colorsRepository = {
  list() {
    return supabase.from('colors').select('*').order('color_name', { ascending: true });
  },
  listAvailable() {
    return supabase
      .from('colors')
      .select('*')
      .eq('availability', 'available')
      .order('color_name', { ascending: true });
  },
  create(payload: TableInsert<'colors'>) {
    return supabase.from('colors').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'colors'>) {
    return supabase.from('colors').update(payload).eq('id', id).select('*').single();
  },
  remove(id: string) {
    return supabase.from('colors').delete().eq('id', id);
  },
};

const splitProductPayload = (payload: ProductFormValues) => {
  const { colorIds, ...productPayload } = payload;
  return { colorIds, productPayload };
};

async function replaceProductColors(productId: string, colorIds: string[]) {
  const deleteResult = await supabase
    .from('product_colors')
    .delete()
    .eq('product_id', productId);

  if (deleteResult.error) {
    return deleteResult;
  }

  if (colorIds.length === 0) {
    return { error: null };
  }

  return supabase.from('product_colors').insert(
    colorIds.map((colorId) => ({
      product_id: productId,
      color_id: colorId,
    })),
  );
}

export const productsRepository = {
  list() {
    return supabase
      .from('products')
      .select('*, product_colors(color_id, colors(*))')
      .order('created_at', { ascending: false });
  },
  getById(id: string) {
    return supabase.from('products').select('*').eq('id', id).single();
  },
  async create(payload: ProductFormValues) {
    const { colorIds, productPayload } = splitProductPayload(payload);
    const result = await supabase
      .from('products')
      .insert(productPayload)
      .select('*')
      .single();

    if (result.error || !result.data) {
      return result;
    }

    const colorResult = await replaceProductColors(result.data.id, colorIds);

    if (colorResult.error) {
      return { data: null, error: colorResult.error };
    }

    return result;
  },
  async update(id: string, payload: ProductFormValues) {
    const { colorIds, productPayload } = splitProductPayload(payload);
    const result = await supabase
      .from('products')
      .update(productPayload)
      .eq('id', id)
      .select('*')
      .single();

    if (result.error) {
      return result;
    }

    const colorResult = await replaceProductColors(id, colorIds);

    if (colorResult.error) {
      return { data: null, error: colorResult.error };
    }

    return result;
  },
  remove(id: string) {
    return supabase.from('products').delete().eq('id', id);
  },
  listAvailable() {
    return supabase
      .from('products')
      .select('*, product_colors(color_id, colors(*))')
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
