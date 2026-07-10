import { StatusChip } from '@/components/ui';
import { DetailViewLayout } from '@/features/crud';
import type { ProductCategory } from '@/features/products/types';
import { formatCatalogDate } from '@/features/products/utils/catalogFormatters';

interface CategoryDetailsProps {
  category: ProductCategory;
}

export function CategoryDetails({ category }: CategoryDetailsProps) {
  return (
    <DetailViewLayout
      title={category.name}
      description="Read-only category details."
      status={
        <StatusChip
          status={category.availability === 'available' ? 'ready' : 'cancelled'}
          label={category.availability === 'available' ? 'Active' : 'Inactive'}
        />
      }
      sections={[
        {
          title: 'Category Information',
          items: [
            { label: 'Category Name', value: category.name },
            { label: 'Sort Order', value: category.sort_order },
            { label: 'Description', value: category.description || 'No description' },
            { label: 'Created At', value: formatCatalogDate(category.created_at) },
          ],
        },
      ]}
    />
  );
}
