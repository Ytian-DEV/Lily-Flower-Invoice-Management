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
  CategoryDetails,
  CategoryForm,
  ColorDetails,
  ColorForm,
  ProductDetails,
  ProductForm,
  useProductCatalog,
  type Addon,
  type CatalogDialogMode,
  type CatalogTab,
  type Color,
  type ProductCategory,
  type ProductViewModel,
} from '@/features/products';
import {
  formatCatalogDate,
  formatPeso,
} from '@/features/products/utils/catalogFormatters';
import { addonsRepository } from '@/services/repositories/addonsRepository';
import {
  colorsRepository,
  productCategoriesRepository,
  productsRepository,
} from '@/services/repositories/productsRepository';
import type { ProductAvailability } from '@/types/database';
import type {
  AddonFormValues,
  ColorFormValues,
  ProductCategoryFormValues,
  ProductFormValues,
} from '@/validation';

const tabs: TabItem[] = [
  { id: 'products', label: 'Bouquets' },
  { id: 'addons', label: 'Add-ons' },
  { id: 'colors', label: 'Colors' },
  { id: 'categories', label: 'Categories' },
];

const pageSize = 10;

export function ProductsPage() {
  const { showToast } = useToast();
  const {
    addons,
    categories,
    colors,
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
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    ProductViewModel | Addon | Color | ProductCategory | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeItems =
    activeTab === 'products'
      ? products
      : activeTab === 'addons'
        ? addons
        : activeTab === 'colors'
          ? colors
          : categories;
  const pageCount = Math.max(1, Math.ceil(activeItems.length / pageSize));
  const paginatedProducts = useMemo(
    () => products.slice((page - 1) * pageSize, page * pageSize),
    [page, products],
  );
  const paginatedAddons = useMemo(
    () => addons.slice((page - 1) * pageSize, page * pageSize),
    [addons, page],
  );
  const paginatedColors = useMemo(
    () => colors.slice((page - 1) * pageSize, page * pageSize),
    [colors, page],
  );
  const paginatedCategories = useMemo(
    () => categories.slice((page - 1) * pageSize, page * pageSize),
    [categories, page],
  );

  const productColumns: DataTableColumn<ProductViewModel>[] = [
    { id: 'product_name', header: 'Product Name', accessor: 'product_name' },
    { id: 'category', header: 'Category', accessor: 'categoryName' },
    {
      id: 'colors',
      header: 'Colors',
      cell: (row) =>
        row.colors.length > 0
          ? row.colors.map((color) => color.color_name).join(', ')
          : 'No colors',
    },
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

  const colorColumns: DataTableColumn<Color>[] = [
    { id: 'color_name', header: 'Color Name', accessor: 'color_name' },
    {
      id: 'hex_color',
      header: 'Hex Color',
      cell: (row) => (
        <span className="inline-flex items-center gap-2">
          <span
            className="size-4 rounded-full border border-border"
            style={{ backgroundColor: row.hex_color }}
          />
          {row.hex_color}
        </span>
      ),
    },
    {
      id: 'availability',
      header: 'Status',
      cell: (row) => (
        <StatusChip
          status={row.availability === 'available' ? 'ready' : 'cancelled'}
          label={row.availability === 'available' ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      id: 'description',
      header: 'Description',
      cell: (row) => row.description || 'No description',
    },
  ];

  const categoryColumns: DataTableColumn<ProductCategory>[] = [
    { id: 'name', header: 'Category Name', accessor: 'name' },
    {
      id: 'availability',
      header: 'Status',
      cell: (row) => (
        <StatusChip
          status={row.availability === 'available' ? 'ready' : 'cancelled'}
          label={row.availability === 'available' ? 'Active' : 'Inactive'}
        />
      ),
    },
    { id: 'sort_order', header: 'Sort Order', accessor: 'sort_order' },
    {
      id: 'description',
      header: 'Description',
      cell: (row) => row.description || 'No description',
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
    setSelectedColor(null);
    setSelectedCategory(null);
    setDialogMode('create');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedProduct(null);
    setSelectedAddon(null);
    setSelectedColor(null);
    setSelectedCategory(null);
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

  const handleColorSubmit = async (values: ColorFormValues) => {
    setIsSubmitting(true);
    const result = selectedColor
      ? await colorsRepository.update(selectedColor.id, values)
      : await colorsRepository.create(values);

    setIsSubmitting(false);

    if (result.error) {
      showToast({
        variant: 'error',
        title: 'Color save failed',
        description: result.error.message,
      });
      return;
    }

    showToast({
      variant: 'success',
      title: selectedColor ? 'Color updated' : 'Color created',
    });
    closeDialog();
    await refresh();
  };

  const handleCategorySubmit = async (values: ProductCategoryFormValues) => {
    setIsSubmitting(true);
    const result = selectedCategory
      ? await productCategoriesRepository.update(selectedCategory.id, values)
      : await productCategoriesRepository.create(values);

    setIsSubmitting(false);

    if (result.error) {
      showToast({
        variant: 'error',
        title: 'Category save failed',
        description: result.error.message,
      });
      return;
    }

    showToast({
      variant: 'success',
      title: selectedCategory ? 'Category updated' : 'Category created',
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
        : 'addon_name' in deleteTarget
          ? await addonsRepository.remove(deleteTarget.id)
          : 'color_name' in deleteTarget
            ? await colorsRepository.remove(deleteTarget.id)
            : await productCategoriesRepository.remove(deleteTarget.id);
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

  const renderActions = (row: ProductViewModel | Addon | Color | ProductCategory) => (
    <ActionMenu
      onView={() => {
        if ('product_name' in row) {
          setSelectedProduct(row);
        } else if ('addon_name' in row) {
          setSelectedAddon(row);
        } else if ('color_name' in row) {
          setSelectedColor(row);
        } else {
          setSelectedCategory(row);
        }
        setDialogMode('details');
      }}
      onEdit={() => {
        if ('product_name' in row) {
          setSelectedProduct(row);
        } else if ('addon_name' in row) {
          setSelectedAddon(row);
        } else if ('color_name' in row) {
          setSelectedColor(row);
        } else {
          setSelectedCategory(row);
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
          {activeTab === 'products'
            ? 'Create Bouquet'
            : activeTab === 'addons'
              ? 'Create Add-on'
              : activeTab === 'colors'
                ? 'Create Color'
                : 'Create Category'}
        </Button>
      }
      toolbarSlot={
        <CrudToolbar
          searchValue={searchQuery}
          searchPlaceholder={
            activeTab === 'products'
              ? 'Search products or categories...'
              : activeTab === 'addons'
                ? 'Search add-ons...'
                : activeTab === 'colors'
                  ? 'Search colors...'
                  : 'Search categories...'
          }
          onSearchChange={(value) => {
            setPage(1);
            setSearchQuery(value);
          }}
          onRefresh={refresh}
          onCreate={openCreateDialog}
          createLabel={
            activeTab === 'products'
              ? 'Create Bouquet'
              : activeTab === 'addons'
                ? 'Create Add-on'
                : activeTab === 'colors'
                  ? 'Create Color'
                  : 'Create Category'
          }
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
              {
                label:
                  activeTab === 'colors' || activeTab === 'categories'
                    ? 'Active'
                    : 'Available',
                value: 'available',
              },
              {
                label:
                  activeTab === 'colors' || activeTab === 'categories'
                    ? 'Inactive'
                    : 'Unavailable',
                value: 'unavailable',
              },
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
          ) : activeTab === 'addons' ? (
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
          ) : activeTab === 'colors' ? (
            <CrudTable
              columns={colorColumns}
              data={paginatedColors}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              emptyState={
                <CrudEmptyState
                  title="No colors yet."
                  description="Add color options that can be assigned to bouquets."
                  actionLabel="Add Color"
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
              columns={categoryColumns}
              data={paginatedCategories}
              getRowId={(row) => row.id}
              isLoading={isLoading}
              emptyState={
                <CrudEmptyState
                  title="No categories yet."
                  description="Add bouquet categories for product organization."
                  actionLabel="Add Category"
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
                    ? 'Edit Bouquet'
                    : 'Create Bouquet'
                  : activeTab === 'addons'
                    ? selectedAddon
                      ? 'Edit Add-on'
                      : 'Create Add-on'
                    : activeTab === 'colors'
                      ? selectedColor
                        ? 'Edit Color'
                        : 'Create Color'
                      : selectedCategory
                        ? 'Edit Category'
                        : 'Create Category'
            }
            width="xl"
          >
            {dialogMode === 'details' && selectedProduct ? (
              <ProductDetails product={selectedProduct} />
            ) : null}
            {dialogMode === 'details' && selectedAddon ? (
              <AddonDetails addon={selectedAddon} />
            ) : null}
            {dialogMode === 'details' && selectedColor ? (
              <ColorDetails color={selectedColor} />
            ) : null}
            {dialogMode === 'details' && selectedCategory ? (
              <CategoryDetails category={selectedCategory} />
            ) : null}
            {dialogMode !== 'details' && activeTab === 'products' ? (
              <ProductForm
                categories={categories}
                colors={colors.filter((color) => color.availability === 'available')}
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
            {dialogMode !== 'details' && activeTab === 'colors' ? (
              <ColorForm
                color={selectedColor}
                isSubmitting={isSubmitting}
                onCancel={closeDialog}
                onSubmit={handleColorSubmit}
              />
            ) : null}
            {dialogMode !== 'details' && activeTab === 'categories' ? (
              <CategoryForm
                category={selectedCategory}
                isSubmitting={isSubmitting}
                onCancel={closeDialog}
                onSubmit={handleCategorySubmit}
              />
            ) : null}
          </Modal>
          <DeleteConfirmationDialog
            isOpen={Boolean(deleteTarget)}
            entityLabel={
              deleteTarget
                ? 'product_name' in deleteTarget
                  ? deleteTarget.product_name
                  : 'addon_name' in deleteTarget
                    ? deleteTarget.addon_name
                    : 'color_name' in deleteTarget
                      ? deleteTarget.color_name
                      : deleteTarget.name
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
