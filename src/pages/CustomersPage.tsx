import { useMemo, useState } from 'react';

import {
  Alert,
  Breadcrumbs,
  Button,
  Checkbox,
  FilterPanel,
  Modal,
  type DataTableColumn,
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
  CustomerDetails,
  CustomerForm,
  useCustomerManagement,
  type Customer,
  type CustomerDialogMode,
} from '@/features/customers';
import { formatCustomerDate } from '@/features/customers/utils/customerFormatters';
import { customersRepository } from '@/services/repositories/customersRepository';
import type { CustomerFormValues } from '@/validation';

const pageSize = 10;

export function CustomersPage() {
  const { showToast } = useToast();
  const {
    customers,
    errorMessage,
    filters,
    isLoading,
    refresh,
    resetFilters,
    searchQuery,
    setFilters,
    setSearchQuery,
  } = useCustomerManagement();
  const [page, setPage] = useState(1);
  const [dialogMode, setDialogMode] = useState<CustomerDialogMode | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageCount = Math.max(1, Math.ceil(customers.length / pageSize));
  const paginatedCustomers = useMemo(
    () => customers.slice((page - 1) * pageSize, page * pageSize),
    [customers, page],
  );

  const columns: DataTableColumn<Customer>[] = [
    { id: 'full_name', header: 'Customer Name', accessor: 'full_name' },
    { id: 'phone_number', header: 'Phone Number', accessor: 'phone_number' },
    {
      id: 'delivery_address',
      header: 'Delivery Address',
      cell: (row) => row.delivery_address || 'No address',
    },
    { id: 'total_orders', header: 'Total Orders', cell: () => '0', align: 'right' },
    {
      id: 'balance',
      header: 'Outstanding Balance',
      cell: () => 'PHP 0.00',
      align: 'right',
    },
    { id: 'last_order', header: 'Last Order Date', cell: () => 'Not available' },
    {
      id: 'created_at',
      header: 'Created At',
      cell: (row) => formatCustomerDate(row.created_at),
    },
  ];

  const openCreateDialog = () => {
    setSelectedCustomer(null);
    setDialogMode('create');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedCustomer(null);
  };

  const handleCustomerSubmit = async (values: CustomerFormValues) => {
    setIsSubmitting(true);
    const result = selectedCustomer
      ? await customersRepository.update(selectedCustomer.id, values)
      : await customersRepository.create(values);
    setIsSubmitting(false);

    if (result.error) {
      showToast({
        variant: 'error',
        title: 'Customer save failed',
        description: result.error.message,
      });
      return;
    }

    showToast({
      variant: 'success',
      title: selectedCustomer ? 'Customer updated' : 'Customer created',
    });
    closeDialog();
    await refresh();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsSubmitting(true);
    const invoiceCount = await customersRepository.countInvoices(deleteTarget.id);

    if (invoiceCount.error) {
      setIsSubmitting(false);
      showToast({
        variant: 'error',
        title: 'Delete check failed',
        description: invoiceCount.error.message,
      });
      return;
    }

    if ((invoiceCount.count ?? 0) > 0) {
      setIsSubmitting(false);
      showToast({
        variant: 'warning',
        title: 'Cannot delete customer',
        description:
          'Cannot delete customer because invoices are associated with this record.',
      });
      return;
    }

    const result = await customersRepository.remove(deleteTarget.id);
    setIsSubmitting(false);

    if (result.error) {
      showToast({
        variant: 'error',
        title: 'Delete failed',
        description: result.error.message,
      });
      return;
    }

    showToast({ variant: 'success', title: 'Customer deleted' });
    setDeleteTarget(null);
    await refresh();
  };

  const renderActions = (row: Customer) => (
    <ActionMenu
      onView={() => {
        setSelectedCustomer(row);
        setDialogMode('details');
      }}
      onEdit={() => {
        setSelectedCustomer(row);
        setDialogMode('edit');
      }}
      onDelete={() => setDeleteTarget(row)}
    />
  );

  return (
    <CrudPageContainer
      title="Customers"
      subtitle="Manage reusable customer records for future invoices, payments, and history."
      breadcrumbs={
        <Breadcrumbs
          items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Customers' }]}
        />
      }
      primaryAction={<Button onClick={openCreateDialog}>Create Customer</Button>}
      toolbarSlot={
        <CrudToolbar
          searchValue={searchQuery}
          searchPlaceholder="Search customers, phones, or addresses..."
          onSearchChange={(value) => {
            setPage(1);
            setSearchQuery(value);
          }}
          onRefresh={refresh}
          onCreate={openCreateDialog}
          createLabel="Create Customer"
        />
      }
      filterSlot={
        <FilterPanel
          title="Customer Filters"
          onApply={() => setPage(1)}
          onReset={resetFilters}
        >
          <Checkbox
            label="Has Outstanding Balance"
            helperText="Future-ready placeholder"
            checked={filters.hasOutstandingBalance}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                hasOutstandingBalance: event.target.checked,
              }))
            }
            disabled
          />
          <Checkbox
            label="Has Orders"
            helperText="Future-ready placeholder"
            checked={filters.hasOrders}
            onChange={(event) =>
              setFilters((current) => ({ ...current, hasOrders: event.target.checked }))
            }
            disabled
          />
          <Checkbox
            label="Recently Added"
            checked={filters.recentlyAdded}
            onChange={(event) => {
              setPage(1);
              setFilters((current) => ({
                ...current,
                recentlyAdded: event.target.checked,
              }));
            }}
          />
        </FilterPanel>
      }
      tableSlot={
        <div className="space-y-4">
          {errorMessage ? (
            <Alert variant="error" title="Customer error" description={errorMessage} />
          ) : null}
          <CrudTable
            columns={columns}
            data={paginatedCustomers}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            emptyState={
              <CrudEmptyState
                title="No customers yet."
                description="Add customers to reuse their contact and delivery details later."
                actionLabel="Add Customer"
                onAction={openCreateDialog}
              />
            }
            actions={renderActions}
            page={page}
            pageCount={pageCount}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      }
      dialogSlot={
        <>
          <Modal
            isOpen={dialogMode !== null}
            onClose={closeDialog}
            title={
              dialogMode === 'details'
                ? 'Customer Details'
                : selectedCustomer
                  ? 'Edit Customer'
                  : 'Create Customer'
            }
            width="xl"
          >
            {dialogMode === 'details' && selectedCustomer ? (
              <CustomerDetails customer={selectedCustomer} />
            ) : null}
            {dialogMode !== 'details' ? (
              <CustomerForm
                customer={selectedCustomer}
                isSubmitting={isSubmitting}
                onCancel={closeDialog}
                onSubmit={handleCustomerSubmit}
              />
            ) : null}
          </Modal>
          <DeleteConfirmationDialog
            isOpen={Boolean(deleteTarget)}
            entityLabel={deleteTarget?.full_name ?? 'customer'}
            isLoading={isSubmitting}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        </>
      }
    />
  );
}
