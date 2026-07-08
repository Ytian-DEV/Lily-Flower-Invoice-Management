import { useMemo, useState } from 'react';

import {
  Alert,
  Breadcrumbs,
  Button,
  FilterPanel,
  Modal,
  Select,
  StatusChip,
  Tabs,
  type DataTableColumn,
  type TabItem,
  useToast,
} from '@/components/ui';
import {
  ActionMenu,
  CrudEmptyState,
  CrudPageContainer,
  CrudTable,
  CrudToolbar,
  DeleteConfirmationDialog,
} from '@/features/crud';
import {
  AddonDetails,
  AddonForm,
  ProductDetails,
  ProductForm,
  useProductCatalog,
  type Addon,
  type CatalogDialogMode,
  type CatalogTab,
  type ProductViewModel,
} from '@/features/products';
import {
  formatCatalogDate,
  formatPeso,
} from '@/features/products/utils/catalogFormatters';
import { addonsRepository } from '@/services/repositories/addonsRepository';
import { productsRepository } from '@/services/repositories/productsRepository';
import type { ProductAvailability } from '@/types/database';
import type { AddonFormValues, ProductFormValues } from '@/validation';

const tabs: TabItem[] = [
  { id: 'products', label: 'Bouquets' },
  { id: 'addons', label: 'Add-ons' },
];

const pageSize = 10;

export function ProductsPage() {
  const { showToast } = useToast();
  const {
    addons,
    categories,
    errorMessage,
    filters,
    isLoading,
    products,
    refresh,
    resetFilters,
    searchQuery,
    setFilters,
    setSearchQuery,
  } = useProductCatalog();
  const [activeTab, setActiveTab] = useState<CatalogTab>('products');
  const [page, setPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<CatalogDialogMode | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductViewModel | null>(null);
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductViewModel | Addon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeItems = activeTab === 'products' ? products : addons;
  const pageCount = Math.max(1, Math.ceil(activeItems.length / pageSize));
  const paginatedProducts = useMemo(
    () => products.slice((page - 1) * pageSize, page * pageSize),
    [page, products],
  );
  const paginatedAddons = useMemo(
    () => addons.slice((page - 1) * pageSize, page * pageSize),
    [addons, page],
  );

  const productColumns: DataTableColumn<ProductViewModel>[] = [
    { id: 'product_name', header: 'Product Name', accessor: 'product_name' },
    { id: 'category', header: 'Category', accessor: 'categoryName' },
    {
      id: 'stem_count',
      header: 'Stem Count',
      cell: (row) => row.stem_count ?? 'Not specified',
    },
    {
      id: 'base_price',
      header: 'Base Price',
      align: 'right',
      cell: (row) => formatPeso(row.base_price),
    },
    {
      id: 'availability',
      header: 'Availability',
      cell: (row) => (
        <StatusChip
          status={row.availability === 'available' ? 'ready' : 'cancelled'}
          label={row.availability === 'available' ? 'Available' : 'Unavailable'}
        />
      ),
    },
    {
      id: 'updated_at',
      header: 'Last Updated',
      cell: (row) => formatCatalogDate(row.updated_at),
    },
  ];

  const addonColumns: DataTableColumn<Addon>[] = [
    { id: 'addon_name', header: 'Add-on Name', accessor: 'addon_name' },
    {
      id: 'price',
      header: 'Price',
      align: 'right',
      cell: (row) => formatPeso(row.price),
    },
    {
      id: 'availability',
      header: 'Availability',
      cell: (row) => (
        <StatusChip
          status={row.availability === 'available' ? 'ready' : 'cancelled'}
          label={row.availability === 'available' ? 'Available' : 'Unavailable'}
        />
      ),
    },
    {
      id: 'description',
      header: 'Description',
      cell: (row) => row.description || 'No description',
    },
    {
      id: 'updated_at',
      header: 'Last Updated',
      cell: (row) => formatCatalogDate(row.updated_at),
    },
  ];

  const openCreateDialog = () => {
    setSelectedProduct(null);
    setSelectedAddon(null);
    setDialogMode('create');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedProduct(null);
    setSelectedAddon(null);
  };

  const handleProductSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    const result = selectedProduct
      ? await productsRepository.update(selectedProduct.id, values)
      : await productsRepository.create(values);

    setIsSubmitting(false);

    if (result.error) {
      showToast({
        variant: 'error',
        title: 'Product save failed',
        description: result.error.message,
      });
      return;
    }

    showToast({
      variant: 'success',
      title: selectedProduct ? 'Product updated' : 'Product created',
    });
    closeDialog();
    await refresh();
  };

  const handleAddonSubmit = async (values: AddonFormValues) => {
    setIsSubmitting(true);
    const result = selectedAddon
      ? await addonsRepository.update(selectedAddon.id, values)
      : await addonsRepository.create(values);

    setIsSubmitting(false);

    if (result.error) {
      showToast({
        variant: 'error',
        title: 'Add-on save failed',
        description: result.error.message,
      });
      return;
    }

    showToast({
      variant: 'success',
      title: selectedAddon ? 'Add-on updated' : 'Add-on created',
    });
    closeDialog();
    await refresh();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsSubmitting(true);
    const result =
      'product_name' in deleteTarget
        ? await productsRepository.remove(deleteTarget.id)
        : await addonsRepository.remove(deleteTarget.id);
    setIsSubmitting(false);

    if (result.error) {
      showToast({
        variant: 'error',
        title: 'Delete failed',
        description: result.error.message,
      });
      return;
    }

    showToast({ variant: 'success', title: 'Catalog item deleted' });
    setDeleteTarget(null);
    await refresh();
  };

  const renderActions = (row: ProductViewModel | Addon) => (
    <ActionMenu
      onView={() => {
        if ('product_name' in row) {
          setSelectedProduct(row);
        } else {
          setSelectedAddon(row);
        }
        setDialogMode('details');
      }}
      onEdit={() => {
        if ('product_name' in row) {
          setSelectedProduct(row);
        } else {
          setSelectedAddon(row);
        }
        setDialogMode('edit');
      }}
      onDelete={() => setDeleteTarget(row)}
    />
  );

  const updateAvailability = (availability: string) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      availability: availability as ProductAvailability | 'all',
    }));
  };

  return (
    <CrudPageContainer
      title="Product Catalog"
      subtitle="Manage bouquets and florist add-ons for future invoices and reports."
      breadcrumbs={
        <Breadcrumbs
          items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Products' }]}
        />
      }
      primaryAction={
        <Button onClick={openCreateDialog}>
          {activeTab === 'products' ? 'Create Product' : 'Create Add-on'}
        </Button>
      }
      toolbarSlot={
        <CrudToolbar
          searchValue={searchQuery}
          searchPlaceholder={
            activeTab === 'products'
              ? 'Search products or categories...'
              : 'Search add-ons...'
          }
          onSearchChange={(value) => {
            setPage(1);
            setSearchQuery(value);
          }}
          onRefresh={refresh}
          onCreate={openCreateDialog}
          createLabel={activeTab === 'products' ? 'Create Product' : 'Create Add-on'}
        />
      }
      filterSlot={
        <FilterPanel
          title="Catalog Filters"
          onApply={() => setPage(1)}
          onReset={resetFilters}
        >
          {activeTab === 'products' ? (
            <Select
              label="Category"
              value={filters.categoryId}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, categoryId: event.target.value }));
              }}
              options={[
                { label: 'All Categories', value: 'all' },
                ...categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                })),
              ]}
            />
          ) : null}
          <Select
            label="Availability"
            value={filters.availability}
            onChange={(event) => updateAvailability(event.target.value)}
            options={[
              { label: 'All Availability', value: 'all' },
              { label: 'Available', value: 'available' },
              { label: 'Unavailable', value: 'unavailable' },
            ]}
          />
          <Select
            label="Price Range"
            disabled
            helperText="Future-ready placeholder"
            options={[{ label: 'All Prices', value: 'all' }]}
          />
        </FilterPanel>
      }
      tableSlot={
        <div className="space-y-4">
          <Tabs
            items={tabs}
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as CatalogTab);
              setPage(1);
            }}
            variant="contained"
          />
          {errorMessage ? (
            <Alert variant="error" title="Catalog error" description={errorMessage} />
          ) : null}
          {activeTab === 'products' ? (
            <CrudTable
              columns={productColumns}
              data={paginatedProducts}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              emptyState={
                <CrudEmptyState
                  title="No products yet."
                  description="Add bouquets to begin building the shop catalog."
                  actionLabel="Add Product"
                  onAction={openCreateDialog}
                />
              }
              actions={renderActions}
              page={page}
              pageCount={pageCount}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          ) : (
            <CrudTable
              columns={addonColumns}
              data={paginatedAddons}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              emptyState={
                <CrudEmptyState
                  title="No add-ons yet."
                  description="Add optional extras like ribbon, message cards, or lights."
                  actionLabel="Add Add-on"
                  onAction={openCreateDialog}
                />
              }
              actions={renderActions}
              page={page}
              pageCount={pageCount}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          )}
        </div>
      }
      dialogSlot={
        <>
          <Modal
            isOpen={dialogMode !== null}
            onClose={closeDialog}
            title={
              dialogMode === 'details'
                ? 'Catalog Details'
                : activeTab === 'products'
                  ? selectedProduct
                    ? 'Edit Product'
                    : 'Create Product'
                  : selectedAddon
                    ? 'Edit Add-on'
                    : 'Create Add-on'
            }
            width="xl"
          >
            {dialogMode === 'details' && selectedProduct ? (
              <ProductDetails product={selectedProduct} />
            ) : null}
            {dialogMode === 'details' && selectedAddon ? (
              <AddonDetails addon={selectedAddon} />
            ) : null}
            {dialogMode !== 'details' && activeTab === 'products' ? (
              <ProductForm
                categories={categories}
                product={selectedProduct}
                isSubmitting={isSubmitting}
                onCancel={closeDialog}
                onSubmit={handleProductSubmit}
              />
            ) : null}
            {dialogMode !== 'details' && activeTab === 'addons' ? (
              <AddonForm
                addon={selectedAddon}
                isSubmitting={isSubmitting}
                onCancel={closeDialog}
                onSubmit={handleAddonSubmit}
              />
            ) : null}
          </Modal>
          <DeleteConfirmationDialog
            isOpen={Boolean(deleteTarget)}
            entityLabel={
              deleteTarget
                ? 'product_name' in deleteTarget
                  ? deleteTarget.product_name
                  : deleteTarget.addon_name
                : 'catalog item'
            }
            isLoading={isSubmitting}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        </>
      }
    />
  );
}
