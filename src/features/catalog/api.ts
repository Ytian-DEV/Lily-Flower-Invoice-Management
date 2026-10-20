import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys, unwrap } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { addonsRepository } from '@/services/repositories/addonsRepository';
import {
  colorsRepository,
  productCategoriesRepository,
  productsRepository,
} from '@/services/repositories/productsRepository';
import type { ProductAvailability, TableRow } from '@/types/database';
import type {
  AddonFormValues,
  ColorFormValues,
  ProductCategoryFormValues,
  ProductFormValues,
} from '@/validation';

export type ProductCategory = TableRow<'product_categories'>;
export type Addon = TableRow<'addons'>;
export type Color = TableRow<'colors'>;
export type Product = TableRow<'products'> & {
  categoryName: string;
  colors: Color[];
  colorIds: string[];
};

export type CatalogKind = 'products' | 'addons' | 'colors' | 'categories';

/**
 * The catalog is small and changes rarely, so it is loaded once (four parallel
 * requests) and shared by the catalog page and the order form.
 */
export function useCatalog() {
  return useQuery({
    queryKey: queryKeys.catalog,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const [products, addons, colors, categories] = await Promise.all([
        supabase
          .from('products')
          .select('*, product_colors(color_id)')
          .order('product_name'),
        supabase.from('addons').select('*').order('addon_name'),
        supabase.from('colors').select('*').order('color_name'),
        supabase.from('product_categories').select('*').order('sort_order').order('name'),
      ]);

      const colorRows = unwrap(colors) ?? [];
      const categoryRows = unwrap(categories) ?? [];
      const colorById = new Map(colorRows.map((color) => [color.id, color]));
      const categoryById = new Map(
        categoryRows.map((category) => [category.id, category]),
      );

      const productRows = (unwrap(products) ?? []).map(
        ({ product_colors, ...product }) => {
          const productColors = ((product_colors ?? []) as { color_id: string }[])
            .map((link) => colorById.get(link.color_id))
            .filter((color): color is Color => Boolean(color));

          return {
            ...product,
            categoryName: product.category_id
              ? (categoryById.get(product.category_id)?.name ?? 'Uncategorized')
              : 'Uncategorized',
            colors: productColors,
            colorIds: productColors.map((color) => color.id),
          } satisfies Product;
        },
      );

      return {
        products: productRows,
        addons: unwrap(addons) ?? [],
        colors: colorRows,
        categories: categoryRows,
      };
    },
  });
}

function useCatalogMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.catalog }),
  });
}

export function useSaveProduct() {
  return useCatalogMutation(
    async ({ id, values }: { id?: string; values: ProductFormValues }) =>
      unwrap(
        id
          ? await productsRepository.update(id, values)
          : await productsRepository.create(values),
      ),
  );
}

export function useSaveAddon() {
  return useCatalogMutation(
    async ({ id, values }: { id?: string; values: AddonFormValues }) =>
      unwrap(
        id
          ? await addonsRepository.update(id, values)
          : await addonsRepository.create(values),
      ),
  );
}

export function useSaveColor() {
  return useCatalogMutation(
    async ({ id, values }: { id?: string; values: ColorFormValues }) =>
      unwrap(
        id
          ? await colorsRepository.update(id, values)
          : await colorsRepository.create(values),
      ),
  );
}

export function useSaveCategory() {
  return useCatalogMutation(
    async ({ id, values }: { id?: string; values: ProductCategoryFormValues }) =>
      unwrap(
        id
          ? await productCategoriesRepository.update(id, values)
          : await productCategoriesRepository.create(values),
      ),
  );
}

const tableByKind = {
  products: 'products',
  addons: 'addons',
  colors: 'colors',
  categories: 'product_categories',
} as const;

export function useSetAvailability() {
  return useCatalogMutation(
    async ({
      availability,
      id,
      kind,
    }: {
      kind: CatalogKind;
      id: string;
      availability: ProductAvailability;
    }) =>
      unwrap(
        await supabase.from(tableByKind[kind]).update({ availability }).eq('id', id),
      ),
  );
}

export function useDeleteCatalogItem() {
  return useCatalogMutation(async ({ id, kind }: { kind: CatalogKind; id: string }) => {
    const { count, error } = await supabase
      .from(tableByKind[kind])
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    if (!count) {
      throw new Error('Only an admin can delete catalog items.');
    }
  });
}
