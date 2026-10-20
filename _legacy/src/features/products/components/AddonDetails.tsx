import { StatusChip } from '@/components/ui';
import { DetailViewLayout } from '@/features/crud';
import type { Addon } from '@/features/products/types';
import {
  formatCatalogDate,
  formatPeso,
} from '@/features/products/utils/catalogFormatters';

interface AddonDetailsProps {
  addon: Addon;
}

export function AddonDetails({ addon }: AddonDetailsProps) {
  return (
    <DetailViewLayout
      title={addon.addon_name}
      description="Read-only add-on catalog details."
      status={
        <StatusChip
          status={addon.availability === 'available' ? 'ready' : 'cancelled'}
          label={addon.availability === 'available' ? 'Available' : 'Unavailable'}
        />
      }
      sections={[
        {
          title: 'Add-on Information',
          items: [
            { label: 'Add-on Name', value: addon.addon_name },
            { label: 'Price', value: formatPeso(addon.price) },
            { label: 'Availability', value: addon.availability },
            { label: 'Description', value: addon.description || 'No description' },
            { label: 'Created At', value: formatCatalogDate(addon.created_at) },
            { label: 'Updated At', value: formatCatalogDate(addon.updated_at) },
          ],
        },
      ]}
    />
  );
}
