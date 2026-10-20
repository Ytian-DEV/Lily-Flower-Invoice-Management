import type { Addon, Product } from '@/features/catalog/api';
import type { SmartStemSuggestion } from '@/features/orders/types';

export function getSmartStemSuggestion(
  requestedStems: number,
  products: Product[],
  addons: Addon[],
): SmartStemSuggestion | null {
  if (requestedStems <= 0) {
    return null;
  }

  const sortedProducts = products
    .filter((product) => product.availability === 'available' && product.stem_count)
    .sort((a, b) => (b.stem_count ?? 0) - (a.stem_count ?? 0));
  const closestProduct = sortedProducts.find(
    (product) => (product.stem_count ?? 0) < requestedStems,
  );

  if (!closestProduct?.stem_count) {
    return null;
  }

  const extraStemAddon =
    addons.find((addon) => addon.addon_name.toLowerCase().includes('extra stem')) ?? null;

  return {
    requestedStems,
    product: closestProduct,
    extraStemAddon,
    extraStemsNeeded: requestedStems - closestProduct.stem_count,
  };
}
