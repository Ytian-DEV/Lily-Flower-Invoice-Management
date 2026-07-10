import { useCallback, useEffect, useMemo, useState } from 'react';

import { customersRepository } from '@/services/repositories/customersRepository';
import { addonsRepository } from '@/services/repositories/addonsRepository';
import {
  productCategoriesRepository,
  productsRepository,
} from '@/services/repositories/productsRepository';
import { invoicesRepository } from '@/services/repositories/invoicesRepository';
import type { Customer } from '@/features/customers';
import type {
  Addon,
  Color,
  Product,
  ProductCategory,
  ProductViewModel,
} from '@/features/products';
import type { Order } from '@/features/orders/types';

export function useOrderData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    const [
      customersResult,
      productsResult,
      addonsResult,
      categoriesResult,
      ordersResult,
    ] = await Promise.all([
      customersRepository.list(),
      productsRepository.list(),
      addonsRepository.list(),
      productCategoriesRepository.list(),
      invoicesRepository.list(),
    ]);

    if (
      customersResult.error ||
      productsResult.error ||
      addonsResult.error ||
      categoriesResult.error ||
      ordersResult.error
    ) {
      setErrorMessage('Unable to load order data. Please try again.');
      setIsLoading(false);
      return;
    }

    setCustomers(customersResult.data ?? []);
    setProducts(productsResult.data ?? []);
    setAddons(addonsResult.data ?? []);
    setCategories(categoriesResult.data ?? []);
    setOrders(ordersResult.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const productsWithCategory = useMemo<ProductViewModel[]>(() => {
    const categoryMap = new Map(
      categories.map((category) => [category.id, category.name]),
    );

    return products.map((product) => {
      const productColors =
        'product_colors' in product && Array.isArray(product.product_colors)
          ? product.product_colors
              .map((item) =>
                item && typeof item === 'object' && 'colors' in item
                  ? (item.colors as Color | null)
                  : null,
              )
              .filter((color): color is Color => Boolean(color))
          : [];

      return {
        ...product,
        categoryName: product.category_id
          ? (categoryMap.get(product.category_id) ?? 'Uncategorized')
          : 'Uncategorized',
        colors: productColors,
        colorIds: productColors.map((color) => color.id),
      };
    });
  }, [categories, products]);

  return {
    addons,
    customers,
    errorMessage,
    isLoading,
    orders,
    products: productsWithCategory,
    refresh: load,
  };
}
