import { Receipt, Wallet } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

import { PageContainer } from '@/components/layout/PageContainer';
import {
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  type DataTableColumn,
} from '@/components/ui';
import {
  PAYMENTS_PAGE_SIZE,
  usePayments,
  type PaymentFilters,
  type PaymentRow,
} from '@/features/payments/api';
import { paymentMethodLabels, paymentMethodOptions } from '@/lib/labels';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

const periodOptions = [
  { value: 'all', label: 'All time' },
  { value: 'month', label: 'This month' },
  { value: '30d', label: 'Last 30 days' },
];

const columns: DataTableColumn<PaymentRow>[] = [
  {
    id: 'date',
    header: 'Date',
    cell: (row) => (
      <span className="whitespace-nowrap">
        {formatDate(row.payment_date, 'MMM d, yyyy')}
      </span>
    ),
  },
  {
    id: 'order',
    header: 'Order',
    cell: (row) => (
      <div className="max-w-52">
        <p className="font-medium whitespace-nowrap tabular-nums">
          {row.invoices?.invoice_number ?? '—'}
        </p>
        <p className="truncate text-xs text-muted">{row.invoices?.customer_name}</p>
      </div>
    ),
  },
  {
    id: 'method',
    header: 'Method',
    hideBelow: 'sm',
    cell: (row) => paymentMethodLabels[row.payment_method],
  },
  {
    id: 'reference',
    header: 'Reference',
    hideBelow: 'md',
    cell: (row) =>
      row.reference_number ? (
        <span className="tabular-nums">{row.reference_number}</span>
      ) : (
        <span className="text-subtle">—</span>
      ),
  },
  {
    id: 'receipt',
    header: <span className="sr-only">Receipt</span>,
    hideBelow: 'md',
    cell: (row) =>
      row.payment_receipts.length ? (
        <Receipt aria-label="Receipt attached" className="size-4 text-subtle" />
      ) : null,
  },
  {
    id: 'amount',
    header: 'Amount',
    align: 'right',
    cell: (row) => (
      <span className="font-medium tabular-nums">{formatCurrency(row.amount)}</span>
    ),
  },
];

export function PaymentsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const filters: PaymentFilters = {
    search: params.get('q') ?? '',
    method: (params.get('method') as PaymentFilters['method']) ?? 'all',
    period: (params.get('period') as PaymentFilters['period']) ?? 'all',
    page: Math.max(1, Number(params.get('page')) || 1),
  };
  const payments = usePayments(filters);

  const updateFilter = (key: string, value: string, defaultValue: string) => {
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
  };

  return (
    <PageContainer>
      <PageHeader
        title="Payments"
        description="Every downpayment and payment received. Record new payments from an order."
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <SearchInput
          value={filters.search}
          onChange={(value) => updateFilter('q', value, '')}
          placeholder="Invoice no. or customer"
          label="Search payments"
        />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
          <Select
            containerClassName="shrink-0"
            aria-label="Payment method"
            value={filters.method}
            onChange={(event) => updateFilter('method', event.target.value, 'all')}
            options={[{ value: 'all', label: 'All methods' }, ...paymentMethodOptions]}
          />
          <Select
            containerClassName="shrink-0"
            aria-label="Period"
            value={filters.period}
            onChange={(event) => updateFilter('period', event.target.value, 'all')}
            options={periodOptions}
          />
        </div>
      </div>

      {payments.isError ? (
        <ErrorState
          description={payments.error.message}
          onRetry={() => payments.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={payments.data?.rows ?? []}
          getRowId={(row) => row.id}
          isLoading={payments.isPending}
          onRowClick={(row) => row.invoices && navigate(`/orders/${row.invoices.id}`)}
          rowLabel={(row) => `Open order ${row.invoices?.invoice_number ?? ''}`}
          renderMobileRow={(row) => (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-text">
                  {row.invoices?.customer_name ?? 'Order'}
                </p>
                <p className="text-xs text-muted tabular-nums">
                  {formatDate(row.payment_date, 'MMM d')} ·{' '}
                  {paymentMethodLabels[row.payment_method]}
                  {' · '}
                  {row.invoices?.invoice_number}
                </p>
              </div>
              <span className="font-medium whitespace-nowrap tabular-nums">
                {formatCurrency(row.amount)}
              </span>
            </div>
          )}
          empty={
            <EmptyState
              icon={<Wallet aria-hidden="true" />}
              title="No payments found"
              description="Payments are added when an order takes a downpayment, or from the order page."
            />
          }
          footer={
            <>
              {payments.data && payments.data.rows.length > 0 ? (
                <div className="flex justify-between border-t border-border bg-surface-muted px-5 py-3 text-sm">
                  <span className="text-muted">
                    {payments.data.total}{' '}
                    {payments.data.total === 1 ? 'payment' : 'payments'}
                    {payments.data.total > PAYMENTS_PAGE_SIZE
                      ? ' · total for this page'
                      : ''}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(payments.data.pageTotal)}
                  </span>
                </div>
              ) : null}
              <Pagination
                page={filters.page}
                pageSize={PAYMENTS_PAGE_SIZE}
                total={payments.data?.total ?? 0}
                onPageChange={(page) => updateFilter('page', String(page), '1')}
              />
            </>
          }
        />
      )}
    </PageContainer>
  );
}
