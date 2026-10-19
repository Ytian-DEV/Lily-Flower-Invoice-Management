import { supabase } from '@/lib/supabase';
import type { TableInsert, TableUpdate } from '@/types/database';
import type { ProductFormValues } from '@/validation';

export const productCategoriesRepository = {
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
};

export const colorsRepository = {
  create(payload: TableInsert<'colors'>) {
    return supabase.from('colors').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'colors'>) {
    return supabase.from('colors').update(payload).eq('id', id).select('*').single();
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
};
