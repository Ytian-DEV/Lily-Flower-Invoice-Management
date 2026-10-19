import { useMemo, useState } from 'react';
import { Eye, EyeOff, Flower2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router';

import { PageContainer } from '@/components/layout/PageContainer';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  Menu,
  PageHeader,
  SearchInput,
  Select,
  Tabs,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import {
  useCatalog,
  useDeleteCatalogItem,
  useSetAvailability,
  type Addon,
  type CatalogKind,
  type Color,
  type Product,
  type ProductCategory,
} from '@/features/catalog/api';
import {
  AddonFormModal,
  CategoryFormModal,
  ColorFormModal,
  ProductFormModal,
} from '@/features/catalog/components/CatalogForms';
import type { ProductAvailability } from '@/types/database';
import { formatCurrency } from '@/utils/formatCurrency';

type CatalogItem = Product | Addon | Color | ProductCategory;

const kindLabels: Record<CatalogKind, { tab: string; singular: string }> = {
  products: { tab: 'Bouquets', singular: 'bouquet' },
  addons: { tab: 'Add-ons', singular: 'add-on' },
  colors: { tab: 'Colors', singular: 'color' },
  categories: { tab: 'Categories', singular: 'category' },
};

function itemName(kind: CatalogKind, item: CatalogItem) {
  if (kind === 'products') return (item as Product).product_name;
  if (kind === 'addons') return (item as Addon).addon_name;
  if (kind === 'colors') return (item as Color).color_name;
  return (item as ProductCategory).name;
}

function AvailabilityBadge({ value }: { value: ProductAvailability }) {
  return value === 'available' ? (
    <Badge tone="success" withDot>
      Available
    </Badge>
  ) : (
    <Badge tone="neutral" withDot>
      Hidden
    </Badge>
  );
}

function Swatch({ hex }: { hex: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-3.5 shrink-0 rounded-full ring-1 ring-black/10"
      style={{ backgroundColor: hex }}
    />
  );
}

export function CatalogPage() {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const kind = (params.get('tab') as CatalogKind) ?? 'products';
  const catalog = useCatalog();
  const setAvailability = useSetAvailability();
  const deleteItem = useDeleteCatalogItem();
  const [search, setSearch] = useState('');
  const [availability, setAvailabilityFilter] = useState<'all' | ProductAvailability>(
    'all',
  );
  const [editing, setEditing] = useState<CatalogItem | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
  const data = catalog.data;

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const source: CatalogItem[] = data ? data[kind] : [];

    return source.filter((item) => {
      const matchesAvailability =
        availability === 'all' || item.availability === availability;
      const haystack = [
        itemName(kind, item),
        kind === 'products' ? (item as Product).categoryName : '',
        'description' in item ? (item.description ?? '') : '',
      ]
        .join(' ')
        .toLowerCase();
      return matchesAvailability && (!term || haystack.includes(term));
    });
  }, [availability, data, kind, search]);

  const productCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of data?.products ?? []) {
      if (product.category_id) {
        counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1);
      }
    }
    return counts;
  }, [data]);

  const toggleAvailability = async (item: CatalogItem) => {
    const next: ProductAvailability =
      item.availability === 'available' ? 'unavailable' : 'available';

    try {
      await setAvailability.mutateAsync({ kind, id: item.id, availability: next });
      showToast({
        variant: 'success',
        title:
          next === 'available'
            ? `${itemName(kind, item)} is available again`
            : `${itemName(kind, item)} hidden from new orders`,
      });
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Not updated',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteItem.mutateAsync({ kind, id: deleteTarget.id });
      showToast({ variant: 'success', title: `${itemName(kind, deleteTarget)} deleted` });
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Not deleted',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const columnsByKind: Record<CatalogKind, DataTableColumn<CatalogItem>[]> = {
    products: [
      {
        id: 'name',
        header: 'Bouquet',
        cell: (item) => {
          const product = item as Product;
          return (
            <div>
              <p className="font-medium">{product.product_name}</p>
              <p className="text-xs text-muted">{product.categoryName}</p>
            </div>
          );
        },
      },
      {
        id: 'stems',
        header: 'Stems',
        align: 'right',
        hideBelow: 'sm',
        cell: (item) =>
          (item as Product).stem_count ?? <span className="text-subtle">—</span>,
      },
      {
        id: 'colors',
        header: 'Colors',
        hideBelow: 'md',
        cell: (item) => {
          const colors = (item as Product).colors;
          return colors.length ? (
            <span
              className="flex items-center gap-1"
              title={colors.map((c) => c.color_name).join(', ')}
            >
              {colors.slice(0, 6).map((color) => (
                <Swatch key={color.id} hex={color.hex_color} />
              ))}
              {colors.length > 6 ? (
                <span className="text-xs text-muted">+{colors.length - 6}</span>
              ) : null}
            </span>
          ) : (
            <span className="text-subtle">—</span>
          );
        },
      },
      {
        id: 'price',
        header: 'Price',
        align: 'right',
        cell: (item) => (
          <span className="tabular-nums">
            {formatCurrency((item as Product).base_price)}
          </span>
        ),
      },
      {
        id: 'availability',
        header: 'Availability',
        hideBelow: 'sm',
        cell: (item) => <AvailabilityBadge value={item.availability} />,
      },
    ],
    addons: [
      {
        id: 'name',
        header: 'Add-on',
        cell: (item) => (
          <div className="max-w-80">
            <p className="font-medium">{(item as Addon).addon_name}</p>
            {(item as Addon).description ? (
              <p className="truncate text-xs text-muted">{(item as Addon).description}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'price',
        header: 'Price',
        align: 'right',
        cell: (item) => (
          <span className="tabular-nums">{formatCurrency((item as Addon).price)}</span>
        ),
      },
      {
        id: 'availability',
        header: 'Availability',
        hideBelow: 'sm',
        cell: (item) => <AvailabilityBadge value={item.availability} />,
      },
    ],
    colors: [
      {
        id: 'name',
        header: 'Color',
        cell: (item) => (
          <span className="inline-flex items-center gap-2.5 font-medium">
            <Swatch hex={(item as Color).hex_color} />
            {(item as Color).color_name}
          </span>
        ),
      },
      {
        id: 'hex',
        header: 'Swatch',
        hideBelow: 'sm',
        cell: (item) => (
          <span className="font-mono text-xs text-muted">
            {(item as Color).hex_color}
          </span>
        ),
      },
      {
        id: 'availability',
        header: 'Availability',
        cell: (item) => <AvailabilityBadge value={item.availability} />,
      },
    ],
    categories: [
      {
        id: 'name',
        header: 'Category',
        cell: (item) => (
          <div className="max-w-80">
            <p className="font-medium">{(item as ProductCategory).name}</p>
            {(item as ProductCategory).description ? (
              <p className="truncate text-xs text-muted">
                {(item as ProductCategory).description}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'count',
        header: 'Bouquets',
        align: 'right',
        cell: (item) => (
          <span className="tabular-nums">{productCountByCategory.get(item.id) ?? 0}</span>
        ),
      },
      {
        id: 'order',
        header: 'Order',
        align: 'right',
        hideBelow: 'sm',
        cell: (item) => (
          <span className="tabular-nums text-muted">
            {(item as ProductCategory).sort_order}
          </span>
        ),
      },
      {
        id: 'availability',
        header: 'Availability',
        hideBelow: 'sm',
        cell: (item) => <AvailabilityBadge value={item.availability} />,
      },
    ],
  };

  const editingItem = editing === 'new' ? null : editing;
  const closeForm = () => setEditing(null);
  const singular = kindLabels[kind].singular;

  return (
    <PageContainer>
      <PageHeader
        title="Catalog"
        description="Bouquets, add-ons and colors offered on new orders."
        actions={
          <Button
            leftIcon={<Plus aria-hidden="true" className="size-4" />}
            onClick={() => setEditing('new')}
          >
            Add {singular}
          </Button>
        }
      />

      <Tabs
        label="Catalog sections"
        className="mb-4"
        value={kind}
        onChange={(value) => {
          setSearch('');
          setParams(value === 'products' ? {} : { tab: value }, { replace: true });
        }}
        items={(Object.keys(kindLabels) as CatalogKind[]).map((value) => ({
          value,
          label: kindLabels[value].tab,
          count: data?.[value].length,
        }))}
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <SearchInput
          key={kind}
          value={search}
          onChange={setSearch}
          delay={150}
          placeholder={`Search ${kindLabels[kind].tab.toLowerCase()}`}
          label={`Search ${kindLabels[kind].tab.toLowerCase()}`}
        />
        <Select
          aria-label="Availability"
          containerClassName="sm:w-44"
          value={availability}
          onChange={(event) =>
            setAvailabilityFilter(event.target.value as typeof availability)
          }
          options={[
            { value: 'all', label: 'All' },
            { value: 'available', label: 'Available' },
            { value: 'unavailable', label: 'Hidden' },
          ]}
        />
      </div>

      {catalog.isError ? (
        <ErrorState
          description={catalog.error.message}
          onRetry={() => catalog.refetch()}
        />
      ) : (
        <DataTable
          columns={columnsByKind[kind]}
          rows={rows}
          getRowId={(item) => item.id}
          isLoading={catalog.isPending}
          onRowClick={setEditing}
          rowLabel={(item) => `Edit ${itemName(kind, item)}`}
          actions={(item) => (
            <Menu
              label={`Actions for ${itemName(kind, item)}`}
              items={[
                {
                  label: 'Edit',
                  icon: <Pencil aria-hidden="true" />,
                  onSelect: () => setEditing(item),
                },
                {
                  label:
                    item.availability === 'available'
                      ? 'Hide from new orders'
                      : 'Make available',
                  icon:
                    item.availability === 'available' ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    ),
                  onSelect: () => toggleAvailability(item),
                },
                {
                  label: 'Delete',
                  icon: <Trash2 aria-hidden="true" />,
                  isDanger: true,
                  hidden: !isAdmin,
                  onSelect: () => setDeleteTarget(item),
                },
              ]}
            />
          )}
          empty={
            search || availability !== 'all' ? (
              <EmptyState title="Nothing matches" description="Try a different search." />
            ) : (
              <EmptyState
                icon={<Flower2 aria-hidden="true" />}
                title={`No ${kindLabels[kind].tab.toLowerCase()} yet`}
                action={<Button onClick={() => setEditing('new')}>Add {singular}</Button>}
              />
            )
          }
        />
      )}

      {kind === 'products' ? (
        <ProductFormModal
          key={editingItem?.id ?? 'new'}
          isOpen={editing !== null}
          product={editingItem as Product | null}
          categories={data?.categories ?? []}
          colors={data?.colors ?? []}
          onClose={closeForm}
        />
      ) : null}
      {kind === 'addons' ? (
        <AddonFormModal
          key={editingItem?.id ?? 'new'}
          isOpen={editing !== null}
          addon={editingItem as Addon | null}
          onClose={closeForm}
        />
      ) : null}
      {kind === 'colors' ? (
        <ColorFormModal
          key={editingItem?.id ?? 'new'}
          isOpen={editing !== null}
          color={editingItem as Color | null}
          onClose={closeForm}
        />
      ) : null}
      {kind === 'categories' ? (
        <CategoryFormModal
          key={editingItem?.id ?? 'new'}
          isOpen={editing !== null}
          category={editingItem as ProductCategory | null}
          onClose={closeForm}
        />
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget ? itemName(kind, deleteTarget) : singular}?`}
        description={
          kind === 'products' || kind === 'addons'
            ? 'Past invoices keep their item names. To stop offering it without deleting, choose "Hide from new orders" instead.'
            : 'This cannot be undone.'
        }
        confirmLabel="Delete"
        isDanger
        isLoading={deleteItem.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </PageContainer>
  );
}
