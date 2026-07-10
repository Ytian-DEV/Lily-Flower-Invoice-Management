import { StatusChip } from '@/components/ui';
import { DetailViewLayout } from '@/features/crud';
import type { Color } from '@/features/products/types';
import { formatCatalogDate } from '@/features/products/utils/catalogFormatters';

interface ColorDetailsProps {
  color: Color;
}

export function ColorDetails({ color }: ColorDetailsProps) {
  return (
    <DetailViewLayout
      title={color.color_name}
      description="Read-only color details."
      status={
        <StatusChip
          status={color.availability === 'available' ? 'ready' : 'cancelled'}
          label={color.availability === 'available' ? 'Active' : 'Inactive'}
        />
      }
      sections={[
        {
          title: 'Color Information',
          items: [
            { label: 'Color Name', value: color.color_name },
            { label: 'Hex Color', value: color.hex_color },
            { label: 'Description', value: color.description || 'No description' },
            { label: 'Created At', value: formatCatalogDate(color.created_at) },
            { label: 'Updated At', value: formatCatalogDate(color.updated_at) },
          ],
        },
      ]}
    />
  );
}
