import { useState } from 'react';
import { ClipboardList, Eye, FileText, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

import { PageContainer } from '@/components/layout/PageContainer';
import {
  ButtonLink,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  Menu,
  OrderStatusBadge,
  PageHeader,
  Pagination,
  PaymentStateBadge,
  SearchInput,
  Select,
  orderStatusLabels,
  useToast,
  type DataTableColumn,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import {
  ORDERS_PAGE_SIZE,
  useDeleteOrder,
  useOrders,
  type OrderListFilters,
  type OrderListRow,
  type OrderSort,
} from '@/features/orders/api';
import type { InvoiceStatus } from '@/types/database';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatPhone } from '@/utils/formatPhone';
import { formatDate, formatRelativeDay } from '@/utils/formatDate';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open (not completed)' },
  ...(Object.keys(orderStatusLabels) as InvoiceStatus[]).map((status) => ({
    value: status,
    label: orderStatusLabels[status],
  })),
];

const paymentOptions = [
  { value: 'all', label: 'Any payment' },
  { value: 'due', label: 'Has balance' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partially_paid', label: 'Partly paid' },
  { value: 'paid', label: 'Paid' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'delivery', label: 'Delivery date' },
  { value: 'balance', label: 'Largest balance' },
];

function readFilters(params: URLSearchParams): OrderListFilters {
  return {
    search: params.get('q') ?? '',
    status: (params.get('status') as OrderListFilters['status']) ?? 'all',
    paymentState: (params.get('payment') as OrderListFilters['paymentState']) ?? 'all',
    sort: (params.get('sort') as OrderSort) ?? 'newest',
    page: Math.max(1, Number(params.get('page')) || 1),
  };
}

export function OrdersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const orders = useOrders(filters);
  const deleteOrder = useDeleteOrder();
  const [deleteTarget, setDeleteTarget] = useState<OrderListRow | null>(null);
  const hasFilters =
    filters.search !== '' || filters.status !== 'all' || filters.paymentState !== 'all';

  const updateFilter = (key: string, value: string, defaultValue: string) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === defaultValue) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        if (key !== 'page') {
          next.delete('page');
        }
        return next;
      },
      { replace: key !== 'page' },
    );
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteOrder.mutateAsync(deleteTarget.id);
      showToast({ variant: 'success', title: `${deleteTarget.invoice_number} deleted` });
      setDeleteTarget(null);
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Order was not deleted',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const columns: DataTableColumn<OrderListRow>[] = [
    {
      id: 'invoice',
      header: 'Order',
      cell: (row) => (
        <div>
          <p className="font-medium whitespace-nowrap tabular-nums">
            {row.invoice_number}
          </p>
          <p className="text-xs text-muted">
            {formatDate(row.created_at, 'MMM d, yyyy')}
          </p>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: (row) => (
        <div className="max-w-48">
          <p className="truncate">{row.customer_name}</p>
          {row.customer_phone ? (
            <p className="text-xs text-muted tabular-nums">
              {formatPhone(row.customer_phone)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: 'delivery',
      header: 'Delivery',
      hideBelow: 'md',
      cell: (row) => (
        <span className="whitespace-nowrap">{formatRelativeDay(row.delivery_date)}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      hideBelow: 'sm',
      cell: (row) => <OrderStatusBadge status={row.status} />,
    },
    {
      id: 'payment',
      header: 'Payment',
      hideBelow: 'lg',
      cell: (row) => <PaymentStateBadge state={row.payment_state} />,
    },
    {
      id: 'total',
      header: 'Total',
      align: 'right',
      cell: (row) => (
        <span className="tabular-nums">{formatCurrency(row.total_amount)}</span>
      ),
    },
    {
      id: 'balance',
      header: 'Balance',
      align: 'right',
      hideBelow: 'md',
      cell: (row) => (
        <span
          className={
            row.remaining_balance > 0
              ? 'text-text tabular-nums'
              : 'text-subtle tabular-nums'
          }
        >
          {row.remaining_balance > 0 ? formatCurrency(row.remaining_balance) : '—'}
        </span>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Orders"
        description={
          orders.data
            ? `${orders.data.total} ${orders.data.total === 1 ? 'order' : 'orders'}`
            : ' '
        }
        actions={
          <ButtonLink
            to="/orders/new"
            leftIcon={<Plus aria-hidden="true" className="size-4" />}
          >
            New order
          </ButtonLink>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <SearchInput
          value={filters.search}
          onChange={(value) => updateFilter('q', value, '')}
          placeholder="Invoice no., customer, phone"
          label="Search orders"
        />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
          <Select
            containerClassName="shrink-0"
            aria-label="Order status"
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value, 'all')}
            options={statusOptions}
          />
          <Select
            containerClassName="shrink-0"
            aria-label="Payment"
            value={filters.paymentState}
            onChange={(event) => updateFilter('payment', event.target.value, 'all')}
            options={paymentOptions}
          />
          <Select
            containerClassName="shrink-0"
            aria-label="Sort by"
            value={filters.sort}
            onChange={(event) => updateFilter('sort', event.target.value, 'newest')}
            options={sortOptions}
          />
        </div>
        {hasFilters ? (
          <button
            type="button"
            className="h-10 px-2 text-sm font-medium text-muted hover:text-text"
            onClick={() => setParams(new URLSearchParams(), { replace: true })}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {orders.isError ? (
        <ErrorState description={orders.error.message} onRetry={() => orders.refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={orders.data?.rows ?? []}
          getRowId={(row) => row.id}
          isLoading={orders.isPending}
          onRowClick={(row) => navigate(`/orders/${row.id}`)}
          rowLabel={(row) => `Open ${row.invoice_number} for ${row.customer_name}`}
          renderMobileRow={(row) => (
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium text-text">
                  {row.customer_name}
                </span>
                <span className="font-medium whitespace-nowrap tabular-nums">
                  {formatCurrency(row.total_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <span className="tabular-nums">{row.invoice_number}</span>
                <span>Delivery {formatRelativeDay(row.delivery_date)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <OrderStatusBadge status={row.status} />
                <PaymentStateBadge state={row.payment_state} />
                {row.remaining_balance > 0 ? (
                  <span className="ml-auto text-xs text-warning-text tabular-nums">
                    {formatCurrency(row.remaining_balance)} due
                  </span>
                ) : null}
              </div>
            </div>
          )}
          actions={(row) => (
            <Menu
              label={`Actions for ${row.invoice_number}`}
              items={[
                {
                  label: 'Open',
                  icon: <Eye aria-hidden="true" />,
                  onSelect: () => navigate(`/orders/${row.id}`),
                },
                {
                  label: 'Edit',
                  icon: <Pencil aria-hidden="true" />,
                  onSelect: () => navigate(`/orders/${row.id}/edit`),
                },
                {
                  label: 'Invoice',
                  icon: <FileText aria-hidden="true" />,
                  onSelect: () => navigate(`/orders/${row.id}/invoice`),
                },
                {
                  label: 'Record payment',
                  icon: <Wallet aria-hidden="true" />,
                  hidden: row.remaining_balance <= 0 || row.status === 'cancelled',
                  onSelect: () => navigate(`/orders/${row.id}?pay=1`),
                },
                {
                  label: 'Delete',
                  icon: <Trash2 aria-hidden="true" />,
                  isDanger: true,
                  hidden: !isAdmin,
                  onSelect: () => setDeleteTarget(row),
                },
              ]}
            />
          )}
          empty={
            hasFilters ? (
              <EmptyState
                title="No orders match these filters"
                description="Try a different search or clear the filters."
              />
            ) : (
              <EmptyState
                icon={<ClipboardList aria-hidden="true" />}
                title="No orders yet"
                description="Orders you create appear here with their invoice and payments."
                action={<ButtonLink to="/orders/new">Create the first order</ButtonLink>}
              />
            )
          }
          footer={
            <Pagination
              page={filters.page}
              pageSize={ORDERS_PAGE_SIZE}
              total={orders.data?.total ?? 0}
              onPageChange={(page) => updateFilter('page', String(page), '1')}
            />
          }
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.invoice_number ?? 'order'}?`}
        description="The order, its items and its payment records are removed permanently. To keep history, set the status to Cancelled instead."
        confirmLabel="Delete order"
        isDanger
        isLoading={deleteOrder.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </PageContainer>
  );
}
