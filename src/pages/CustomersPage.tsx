import { useState } from 'react';
import { MapPin, Pencil, Phone, Trash2, UserPlus, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { PageContainer } from '@/components/layout/PageContainer';
import {
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  Modal,
  OrderStatusBadge,
  PageHeader,
  Pagination,
  SearchInput,
  Skeleton,
  Tabs,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import {
  CUSTOMERS_PAGE_SIZE,
  useCustomerOrders,
  useCustomers,
  useDeleteCustomer,
  type CustomerFilters,
  type CustomerSummary,
} from '@/features/customers/api';
import { CustomerFormModal } from '@/features/customers/components/CustomerForm';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatPhone } from '@/utils/formatPhone';
import { formatDate } from '@/utils/formatDate';

const segments = [
  { value: 'all', label: 'All' },
  { value: 'balance', label: 'With balance' },
  { value: 'recent', label: 'New this month' },
] as const;

const columns: DataTableColumn<CustomerSummary>[] = [
  {
    id: 'name',
    header: 'Customer',
    cell: (row) => (
      <div className="max-w-64">
        <p className="truncate font-medium">{row.full_name}</p>
        <p className="truncate text-xs text-muted">
          {row.delivery_address || 'No address'}
        </p>
      </div>
    ),
  },
  {
    id: 'phone',
    header: 'Phone',
    hideBelow: 'sm',
    cell: (row) => <span className="tabular-nums">{formatPhone(row.phone_number)}</span>,
  },
  {
    id: 'orders',
    header: 'Orders',
    align: 'right',
    hideBelow: 'md',
    cell: (row) => <span className="tabular-nums">{row.order_count}</span>,
  },
  {
    id: 'last',
    header: 'Last order',
    hideBelow: 'lg',
    cell: (row) =>
      row.last_order_at ? (
        formatDate(row.last_order_at, 'MMM d, yyyy')
      ) : (
        <span className="text-subtle">—</span>
      ),
  },
  {
    id: 'balance',
    header: 'Balance',
    align: 'right',
    cell: (row) =>
      row.outstanding_balance > 0 ? (
        <span className="font-medium text-warning-text tabular-nums">
          {formatCurrency(row.outstanding_balance)}
        </span>
      ) : (
        <span className="text-subtle">—</span>
      ),
  },
];

function CustomerPanel({
  customer,
  onClose,
  onDelete,
  onEdit,
}: {
  customer: CustomerSummary | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const orders = useCustomerOrders(customer?.id ?? null);

  return (
    <Modal
      isOpen={Boolean(customer)}
      onClose={onClose}
      title={customer?.full_name ?? ''}
      description={
        customer
          ? `Customer since ${formatDate(customer.created_at, 'MMMM yyyy')} · ${customer.order_count} ${customer.order_count === 1 ? 'order' : 'orders'}`
          : undefined
      }
      size="lg"
      footer={
        <>
          {onDelete ? (
            <Button
              variant="ghost"
              className="text-danger-text sm:mr-auto"
              leftIcon={<Trash2 aria-hidden="true" className="size-4" />}
              onClick={onDelete}
            >
              Delete
            </Button>
          ) : null}
          <Button
            variant="secondary"
            leftIcon={<Pencil aria-hidden="true" className="size-4" />}
            onClick={onEdit}
          >
            Edit
          </Button>
        </>
      }
    >
      {customer ? (
        <div className="grid gap-5">
          <div className="grid gap-2 text-sm">
            <a
              href={`tel:${customer.phone_number}`}
              className="inline-flex items-center gap-2 text-text hover:text-primary-dark"
            >
              <Phone aria-hidden="true" className="size-4 text-subtle" />
              <span className="tabular-nums">{formatPhone(customer.phone_number)}</span>
            </a>
            <p className="flex gap-2 text-text">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-subtle" />
              {customer.delivery_address || 'No address saved'}
            </p>
            {customer.notes ? (
              <p className="rounded-lg bg-surface-muted px-3 py-2 whitespace-pre-line text-muted">
                {customer.notes}
              </p>
            ) : null}
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-text">Orders</h3>
              {customer.outstanding_balance > 0 ? (
                <p className="text-sm text-warning-text">
                  {formatCurrency(customer.outstanding_balance)} to collect
                </p>
              ) : null}
            </div>
            {orders.isPending ? (
              <Skeleton className="h-24" />
            ) : orders.data?.length ? (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {orders.data.map((order) => (
                  <li key={order.id}>
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-muted"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium tabular-nums">
                          {order.invoice_number}
                        </span>
                        <span className="text-xs text-muted">
                          {formatDate(order.created_at, 'MMM d, yyyy')}
                        </span>
                      </span>
                      <OrderStatusBadge status={order.status} />
                      <span className="w-24 text-right tabular-nums">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No orders yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export function CustomersPage() {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const filters: CustomerFilters = {
    search: params.get('q') ?? '',
    segment: (params.get('segment') as CustomerFilters['segment']) ?? 'all',
    page: Math.max(1, Number(params.get('page')) || 1),
  };
  const customers = useCustomers(filters);
  const deleteCustomer = useDeleteCustomer();
  const [selected, setSelected] = useState<CustomerSummary | null>(null);
  const [editing, setEditing] = useState<CustomerSummary | null | 'new'>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerSummary | null>(null);

  const updateFilter = (key: string, value: string, defaultValue: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === defaultValue) next.delete(key);
        else next.set(key, value);
        if (key !== 'page') next.delete('page');
        return next;
      },
      { replace: key !== 'page' },
    );

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCustomer.mutateAsync(deleteTarget.id);
      showToast({ variant: 'success', title: `${deleteTarget.full_name} deleted` });
      setSelected(null);
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Customer was not deleted',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Customers"
        description={
          customers.data
            ? `${customers.data.total} ${customers.data.total === 1 ? 'customer' : 'customers'}`
            : ' '
        }
        actions={
          <Button
            leftIcon={<UserPlus aria-hidden="true" className="size-4" />}
            onClick={() => setEditing('new')}
          >
            Add customer
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Tabs
          label="Customer groups"
          items={segments.map((segment) => ({ ...segment }))}
          value={filters.segment}
          onChange={(value) => updateFilter('segment', value, 'all')}
          className="border-b-0"
        />
        <SearchInput
          value={filters.search}
          onChange={(value) => updateFilter('q', value, '')}
          placeholder="Name, phone, or address"
          label="Search customers"
        />
      </div>

      {customers.isError ? (
        <ErrorState
          description={customers.error.message}
          onRetry={() => customers.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={customers.data?.rows ?? []}
          getRowId={(row) => row.id}
          isLoading={customers.isPending}
          onRowClick={setSelected}
          rowLabel={(row) => `Open ${row.full_name}`}
          renderMobileRow={(row) => (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-text">{row.full_name}</p>
                <p className="text-xs text-muted tabular-nums">
                  {formatPhone(row.phone_number)} · {row.order_count}{' '}
                  {row.order_count === 1 ? 'order' : 'orders'}
                </p>
              </div>
              {row.outstanding_balance > 0 ? (
                <span className="text-sm whitespace-nowrap text-warning-text tabular-nums">
                  {formatCurrency(row.outstanding_balance)}
                </span>
              ) : null}
            </div>
          )}
          empty={
            filters.search || filters.segment !== 'all' ? (
              <EmptyState
                title="No customers match"
                description="Try another name or phone number."
              />
            ) : (
              <EmptyState
                icon={<Users aria-hidden="true" />}
                title="No customers yet"
                description="Save regulars here so their details fill in automatically on new orders."
                action={<Button onClick={() => setEditing('new')}>Add customer</Button>}
              />
            )
          }
          footer={
            <Pagination
              page={filters.page}
              pageSize={CUSTOMERS_PAGE_SIZE}
              total={customers.data?.total ?? 0}
              onPageChange={(page) => updateFilter('page', String(page), '1')}
            />
          }
        />
      )}

      <CustomerPanel
        customer={selected}
        onClose={() => setSelected(null)}
        onEdit={() => {
          setEditing(selected);
          setSelected(null);
        }}
        onDelete={
          isAdmin && selected && selected.order_count === 0
            ? () => setDeleteTarget(selected)
            : undefined
        }
      />

      <CustomerFormModal
        isOpen={editing !== null}
        customer={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.full_name ?? 'customer'}?`}
        description="This customer has no orders. Their saved details will be removed."
        confirmLabel="Delete customer"
        isDanger
        isLoading={deleteCustomer.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </PageContainer>
  );
}
