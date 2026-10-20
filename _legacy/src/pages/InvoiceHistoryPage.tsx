import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CreditCard, Download, Printer } from 'lucide-react';

import {
  Alert,
  Button,
  ConfirmationDialog,
  EmptyState,
  FilterPanel,
  KeyValueDisplay,
  LoadingScreen,
  Select,
  StatusChip,
  type DataTableColumn,
  type StatusChipStatus,
} from '@/components/ui';
import {
  ActionMenu,
  CrudPageContainer,
  CrudTable,
  CrudToolbar,
  DetailViewLayout,
} from '@/features/crud';
import { getInvoicePaymentStatus } from '@/features/orders';
import {
  formatOrderCurrency,
  formatOrderDate,
} from '@/features/orders/utils/orderFormatters';
import { invoicesRepository } from '@/services/repositories/invoicesRepository';
import type { InvoiceStatus, TableRow } from '@/types/database';

type Invoice = TableRow<'invoices'> & {
  customers?: {
    full_name: string;
    phone_number: string;
  } | null;
};

type PaymentFilter = 'all' | 'unpaid' | 'partially-paid' | 'paid';
type BalanceFilter = 'all' | 'outstanding' | 'completed' | 'cancelled';
type SortKey =
  | 'invoice_number'
  | 'delivery_date'
  | 'created_at'
  | 'customer'
  | 'total_amount'
  | 'remaining_balance';

const pageSize = 10;

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const paymentStatusFor = (invoice: Invoice): StatusChipStatus =>
  getInvoicePaymentStatus(invoice);

export function InvoiceHistoryPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all');
  const [paymentStatus, setPaymentStatus] = useState<PaymentFilter>('all');
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadInvoices = async () => {
    setIsLoading(true);
    setErrorMessage('');

    const { data, error } = await invoicesRepository.listWithCustomers();

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setInvoices((data ?? []) as Invoice[]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return invoices
      .filter((invoice) => {
        const customerName = invoice.customers?.full_name ?? '';
        const phone = invoice.customers?.phone_number ?? '';
        const matchesSearch =
          query.length === 0 ||
          invoice.invoice_number.toLowerCase().includes(query) ||
          customerName.toLowerCase().includes(query) ||
          phone.toLowerCase().includes(query) ||
          (invoice.delivery_address ?? '').toLowerCase().includes(query);
        const matchesStatus = status === 'all' || invoice.status === status;
        const invoicePaymentStatus = paymentStatusFor(invoice);
        const matchesPayment =
          paymentStatus === 'all' || invoicePaymentStatus === paymentStatus;
        const matchesBalance =
          balanceFilter === 'all' ||
          (balanceFilter === 'outstanding' && invoice.remaining_balance > 0) ||
          (balanceFilter === 'completed' && invoice.status === 'completed') ||
          (balanceFilter === 'cancelled' && invoice.status === 'cancelled');

        return matchesSearch && matchesStatus && matchesPayment && matchesBalance;
      })
      .sort((first, second) => {
        if (sortKey === 'customer') {
          return (first.customers?.full_name ?? '').localeCompare(
            second.customers?.full_name ?? '',
          );
        }

        const firstValue = first[sortKey] ?? '';
        const secondValue = second[sortKey] ?? '';

        if (typeof firstValue === 'number' && typeof secondValue === 'number') {
          return secondValue - firstValue;
        }

        return String(secondValue).localeCompare(String(firstValue));
      });
  }, [balanceFilter, invoices, paymentStatus, searchQuery, sortKey, status]);

  const pageCount = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const paginatedInvoices = filteredInvoices.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const updateStatus = async (invoice: Invoice, nextStatus: InvoiceStatus) => {
    const { error } = await invoicesRepository.update(invoice.id, { status: nextStatus });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setInvoices((current) =>
      current.map((item) =>
        item.id === invoice.id ? { ...item, status: nextStatus } : item,
      ),
    );
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    const { error } = await invoicesRepository.removeIfAllowed(deleteTarget.id);
    setIsDeleting(false);

    if (error) {
      setErrorMessage(error.message);
      setDeleteTarget(null);
      return;
    }

    setInvoices((current) => current.filter((invoice) => invoice.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const columns: DataTableColumn<Invoice>[] = [
    { id: 'invoice_number', header: 'Invoice Number', accessor: 'invoice_number' },
    {
      id: 'customer',
      header: 'Customer',
      cell: (invoice) => invoice.customers?.full_name ?? 'Manual customer',
    },
    {
      id: 'delivery_date',
      header: 'Delivery Date',
      cell: (invoice) => formatOrderDate(invoice.delivery_date),
    },
    {
      id: 'status',
      header: 'Order Status',
      cell: (invoice) => (
        <Select
          aria-label="Update order status"
          value={invoice.status}
          onChange={(event) => updateStatus(invoice, event.target.value as InvoiceStatus)}
          options={statusOptions}
        />
      ),
    },
    {
      id: 'payment',
      header: 'Payment Status',
      cell: (invoice) => <StatusChip status={paymentStatusFor(invoice)} />,
    },
    {
      id: 'total',
      header: 'Total',
      align: 'right',
      cell: (invoice) => formatOrderCurrency(invoice.total_amount),
    },
    {
      id: 'remaining',
      header: 'Remaining Balance',
      align: 'right',
      cell: (invoice) => formatOrderCurrency(invoice.remaining_balance),
    },
    {
      id: 'created',
      header: 'Created At',
      cell: (invoice) => formatOrderDate(invoice.created_at),
    },
  ];

  if (isLoading) {
    return <LoadingScreen text="Loading invoice history..." />;
  }

  return (
    <CrudPageContainer
      title="Invoice History"
      subtitle="Search, filter, update, and review invoice records."
      primaryAction={
        <Button onClick={() => navigate('/orders/new')}>Generate Invoice</Button>
      }
      toolbarSlot={
        <CrudToolbar
          searchValue={searchQuery}
          searchPlaceholder="Search invoice, customer, phone, or address..."
          onSearchChange={(value) => {
            setPage(1);
            setSearchQuery(value);
          }}
          onRefresh={loadInvoices}
          onCreate={() => navigate('/orders/new')}
          createLabel="Generate Invoice"
        />
      }
      filterSlot={
        <FilterPanel
          title="History Filters"
          onApply={() => setPage(1)}
          onReset={() => {
            setStatus('all');
            setPaymentStatus('all');
            setBalanceFilter('all');
            setSortKey('created_at');
            setPage(1);
          }}
        >
          <Select
            label="Order Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as InvoiceStatus | 'all')}
            options={[{ label: 'All Statuses', value: 'all' }, ...statusOptions]}
          />
          <Select
            label="Payment Status"
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value as PaymentFilter)}
            options={[
              { label: 'All Payments', value: 'all' },
              { label: 'Unpaid', value: 'unpaid' },
              { label: 'Partially Paid', value: 'partially-paid' },
              { label: 'Paid', value: 'paid' },
            ]}
          />
          <Select
            label="Balance"
            value={balanceFilter}
            onChange={(event) => setBalanceFilter(event.target.value as BalanceFilter)}
            options={[
              { label: 'All Balances', value: 'all' },
              { label: 'Outstanding Balance', value: 'outstanding' },
              { label: 'Completed Orders', value: 'completed' },
              { label: 'Cancelled Orders', value: 'cancelled' },
            ]}
          />
          <Select
            label="Sort By"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            options={[
              { label: 'Created Date', value: 'created_at' },
              { label: 'Invoice Number', value: 'invoice_number' },
              { label: 'Delivery Date', value: 'delivery_date' },
              { label: 'Customer Name', value: 'customer' },
              { label: 'Total Amount', value: 'total_amount' },
              { label: 'Remaining Balance', value: 'remaining_balance' },
            ]}
          />
        </FilterPanel>
      }
      tableSlot={
        <div className="space-y-6">
          {errorMessage ? (
            <Alert variant="error" title="History error" description={errorMessage} />
          ) : null}
          <CrudTable
            columns={columns}
            data={paginatedInvoices}
            getRowId={(invoice) => invoice.id}
            emptyState={
              <EmptyState
                title="No invoices yet."
                description="Generate an invoice to start building history."
                primaryAction={
                  <Button onClick={() => navigate('/orders/new')}>
                    Generate Invoice
                  </Button>
                }
              />
            }
            actions={(invoice) => (
              <ActionMenu
                onView={() => setSelectedInvoice(invoice)}
                onEdit={() => navigate(`/orders/${invoice.id}/edit`)}
                onDelete={() => setDeleteTarget(invoice)}
                customActions={[
                  {
                    label: 'Preview',
                    onClick: () => navigate(`/orders/${invoice.id}/preview`),
                  },
                  {
                    label: 'Print',
                    icon: <Printer className="size-4" />,
                    onClick: () => navigate(`/orders/${invoice.id}/preview`),
                  },
                  {
                    label: 'Download PNG',
                    icon: <Download className="size-4" />,
                    onClick: () => navigate(`/orders/${invoice.id}/preview`),
                  },
                  {
                    label: 'Download PDF',
                    icon: <Download className="size-4" />,
                    onClick: () => navigate(`/orders/${invoice.id}/preview`),
                  },
                  {
                    label: 'Add Payment',
                    icon: <CreditCard className="size-4" />,
                    onClick: () => navigate(`/payments/${invoice.id}`),
                  },
                  {
                    label: 'Duplicate',
                    onClick: () => setSelectedInvoice(invoice),
                  },
                ]}
              />
            )}
            page={page}
            pageCount={pageCount}
            pageSize={pageSize}
            onPageChange={setPage}
          />

          {selectedInvoice ? (
            <DetailViewLayout
              title={selectedInvoice.invoice_number}
              status={<StatusChip status={paymentStatusFor(selectedInvoice)} />}
              sections={[
                {
                  title: 'Customer & Delivery',
                  items: [
                    {
                      label: 'Customer',
                      value: selectedInvoice.customers?.full_name ?? 'Manual customer',
                    },
                    {
                      label: 'Phone',
                      value: selectedInvoice.customers?.phone_number ?? 'Not linked',
                    },
                    {
                      label: 'Delivery Date',
                      value: formatOrderDate(selectedInvoice.delivery_date),
                    },
                    {
                      label: 'Delivery Address',
                      value: selectedInvoice.delivery_address ?? 'No address',
                    },
                  ],
                },
                {
                  title: 'Pricing',
                  items: [
                    {
                      label: 'Subtotal',
                      value: formatOrderCurrency(selectedInvoice.subtotal),
                    },
                    {
                      label: 'Discount',
                      value: formatOrderCurrency(selectedInvoice.discount_amount),
                    },
                    {
                      label: 'Delivery Fee',
                      value: formatOrderCurrency(selectedInvoice.delivery_fee),
                    },
                    {
                      label: 'Total',
                      value: formatOrderCurrency(selectedInvoice.total_amount),
                    },
                    {
                      label: 'Remaining Balance',
                      value: formatOrderCurrency(selectedInvoice.remaining_balance),
                    },
                  ],
                },
              ]}
              timelineSlot={
                <Button onClick={() => navigate(`/orders/${selectedInvoice.id}/preview`)}>
                  Invoice Preview
                </Button>
              }
            />
          ) : null}

          {selectedInvoice ? (
            <KeyValueDisplay
              items={[
                { label: 'Created', value: formatOrderDate(selectedInvoice.created_at) },
                { label: 'Edited', value: formatOrderDate(selectedInvoice.updated_at) },
                { label: 'Payments', value: 'Tracked from payment records' },
                { label: 'Status Changes', value: 'Latest status shown above' },
                { label: 'Export Events', value: 'Prepared for future tracking' },
              ]}
            />
          ) : null}

          <ConfirmationDialog
            isOpen={Boolean(deleteTarget)}
            title="Delete invoice?"
            description="Paid invoices are protected by default."
            confirmLabel="Delete"
            isDanger
            isLoading={isDeleting}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        </div>
      }
    />
  );
}
