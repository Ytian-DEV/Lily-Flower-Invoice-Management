import type { TableRow } from '@/types/database';

export type ProductCategory = TableRow<'product_categories'>;
export type Product = TableRow<'products'>;
export type Addon = TableRow<'addons'>;

export interface ProductViewModel extends Product {
  categoryName: string;
}

export type CatalogTab = 'products' | 'addons';
export type CatalogDialogMode = 'create' | 'edit' | 'details';
