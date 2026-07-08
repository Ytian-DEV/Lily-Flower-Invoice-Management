import { DetailViewLayout } from '@/features/crud';
import type { ProductViewModel } from '@/features/products/types';
import {
  formatCatalogDate,
  formatPeso,
} from '@/features/products/utils/catalogFormatters';
import { StatusChip } from '@/components/ui';

interface ProductDetailsProps {
  product: ProductViewModel;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <DetailViewLayout
      title={product.product_name}
      description="Read-only product catalog details."
      status={
        <StatusChip
          status={product.availability === 'available' ? 'ready' : 'cancelled'}
          label={product.availability === 'available' ? 'Available' : 'Unavailable'}
        />
      }
      sections={[
        {
          title: 'Catalog Information',
          items: [
            { label: 'Product Name', value: product.product_name },
            { label: 'Category', value: product.categoryName },
            { label: 'Stem Count', value: product.stem_count ?? 'Not specified' },
            { label: 'Base Price', value: formatPeso(product.base_price) },
            { label: 'Availability', value: product.availability },
            { label: 'Description', value: product.description || 'No description' },
            { label: 'Created At', value: formatCatalogDate(product.created_at) },
            { label: 'Updated At', value: formatCatalogDate(product.updated_at) },
          ],
        },
      ]}
    />
  );
}
