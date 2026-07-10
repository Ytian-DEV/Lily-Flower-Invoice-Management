import type { TableRow } from '@/types/database';

export type ProductCategory = TableRow<'product_categories'>;
export type Product = TableRow<'products'>;
export type Addon = TableRow<'addons'>;
export type Color = TableRow<'colors'>;

export interface ProductViewModel extends Product {
  categoryName: string;
  colors: Color[];
  colorIds: string[];
}

export type CatalogTab = 'products' | 'addons' | 'colors' | 'categories';
export type CatalogDialogMode = 'create' | 'edit' | 'details';
