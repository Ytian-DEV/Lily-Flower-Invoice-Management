import { useCallback, useEffect, useMemo, useState } from 'react';

import { addonsRepository } from '@/services/repositories/addonsRepository';
import {
  colorsRepository,
  productCategoriesRepository,
  productsRepository,
} from '@/services/repositories/productsRepository';
import type { ProductAvailability } from '@/types/database';
import type {
  Addon,
  Color,
  Product,
  ProductCategory,
  ProductViewModel,
} from '@/features/products/types';

export interface CatalogFilters {
  categoryId: string;
  availability: ProductAvailability | 'all';
}

const defaultFilters: CatalogFilters = {
  categoryId: 'all',
  availability: 'all',
};

export function useProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    const [productsResult, addonsResult, categoriesResult, colorsResult] =
      await Promise.all([
        productsRepository.list(),
        addonsRepository.list(),
        productCategoriesRepository.list(),
        colorsRepository.list(),
      ]);

    if (
      productsResult.error ||
      addonsResult.error ||
      categoriesResult.error ||
      colorsResult.error
    ) {
      setErrorMessage('Unable to load product catalog. Please try again.');
      setIsLoading(false);
      return;
    }

    setProducts(productsResult.data ?? []);
    setAddons(addonsResult.data ?? []);
    setCategories(categoriesResult.data ?? []);
    setColors(colorsResult.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearchQuery(searchInput), 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

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

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return productsWithCategory.filter((product) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        product.product_name.toLowerCase().includes(normalizedQuery) ||
        product.categoryName.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        filters.categoryId === 'all' || product.category_id === filters.categoryId;
      const matchesAvailability =
        filters.availability === 'all' || product.availability === filters.availability;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [filters.availability, filters.categoryId, productsWithCategory, searchQuery]);

  const filteredAddons = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return addons.filter((addon) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        addon.addon_name.toLowerCase().includes(normalizedQuery);
      const matchesAvailability =
        filters.availability === 'all' || addon.availability === filters.availability;

      return matchesSearch && matchesAvailability;
    });
  }, [addons, filters.availability, searchQuery]);

  const filteredColors = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return colors.filter((color) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        color.color_name.toLowerCase().includes(normalizedQuery) ||
        color.hex_color.toLowerCase().includes(normalizedQuery);
      const matchesAvailability =
        filters.availability === 'all' || color.availability === filters.availability;

      return matchesSearch && matchesAvailability;
    });
  }, [colors, filters.availability, searchQuery]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        category.name.toLowerCase().includes(normalizedQuery) ||
        (category.description ?? '').toLowerCase().includes(normalizedQuery);
      const matchesAvailability =
        filters.availability === 'all' || category.availability === filters.availability;

      return matchesSearch && matchesAvailability;
    });
  }, [categories, filters.availability, searchQuery]);

  return {
    addons: filteredAddons,
    categories: filteredCategories,
    colors: filteredColors,
    errorMessage,
    filters,
    isLoading,
    products: filteredProducts,
    refresh: loadCatalog,
    resetFilters: () => setFilters(defaultFilters),
    searchQuery: searchInput,
    setFilters,
    setSearchQuery: setSearchInput,
  };
}
