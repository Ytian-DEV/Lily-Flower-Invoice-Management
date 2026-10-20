import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  Alert,
  Breadcrumbs,
  Button,
  FilterPanel,
  Select,
  StatusChip,
  type DataTableColumn,
} from '@/components/ui';
import {
  ActionMenu,
  CrudEmptyState,
  CrudPageContainer,
  CrudTable,
  CrudToolbar,
} from '@/features/crud';
import { getInvoicePaymentStatus, useOrderData, type Order } from '@/features/orders';
import {
  formatOrderCurrency,
  formatOrderDate,
} from '@/features/orders/utils/orderFormatters';
import type { InvoiceStatus } from '@/types/database';

const pageSize = 10;

export function OrdersPage() {
  const navigate = useNavigate();
  const { errorMessage, isLoading, orders, refresh } = useOrderData();
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        order.invoice_number.toLowerCase().includes(normalizedQuery) ||
        (order.delivery_address ?? '').toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === 'all' || order.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, status]);
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const columns: DataTableColumn<Order>[] = [
    { id: 'invoice_number', header: 'Invoice Number', accessor: 'invoice_number' },
    {
      id: 'customer',
      header: 'Customer',
      cell: (row) => row.customer_name,
    },
    {
      id: 'status',
      header: 'Order Status',
      cell: (row) => (
        <StatusChip
          status={row.status === 'out_for_delivery' ? 'out-for-delivery' : row.status}
        />
      ),
    },
    {
      id: 'payment',
      header: 'Payment Status',
      cell: (row) => <StatusChip status={getInvoicePaymentStatus(row)} />,
    },
    {
      id: 'delivery_date',
      header: 'Delivery Date',
      cell: (row) => formatOrderDate(row.delivery_date),
    },
    {
      id: 'delivery_address',
      header: 'Delivery Address',
      cell: (row) => row.delivery_address ?? 'No address',
    },
    {
      id: 'total_amount',
      header: 'Total Amount',
      align: 'right',
      cell: (row) => formatOrderCurrency(row.total_amount),
    },
    {
      id: 'remaining_balance',
      header: 'Remaining Balance',
      align: 'right',
      cell: (row) => formatOrderCurrency(row.remaining_balance),
    },
    {
      id: 'created_at',
      header: 'Created Date',
      cell: (row) => formatOrderDate(row.created_at),
    },
  ];

  return (
    <CrudPageContainer
      title="Orders & Invoices"
      subtitle="Manage order records, pricing, delivery, payment status, and invoice generation."
      breadcrumbs={
        <Breadcrumbs
          items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Orders' }]}
        />
      }
      primaryAction={
        <Button onClick={() => navigate('/orders/new')}>Create Order</Button>
      }
      toolbarSlot={
        <CrudToolbar
          searchValue={searchQuery}
          searchPlaceholder="Search invoice number or delivery address..."
          onSearchChange={(value) => {
            setPage(1);
            setSearchQuery(value);
          }}
          onRefresh={refresh}
          onCreate={() => navigate('/orders/new')}
          createLabel="Create Order"
        />
      }
      filterSlot={
        <FilterPanel
          title="Order Filters"
          onApply={() => setPage(1)}
          onReset={() => setStatus('all')}
        >
          <Select
            label="Order Status"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as InvoiceStatus | 'all');
            }}
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Preparing', value: 'preparing' },
              { label: 'Ready', value: 'ready' },
              { label: 'Out for Delivery', value: 'out_for_delivery' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' },
            ]}
          />
        </FilterPanel>
      }
      tableSlot={
        <div className="space-y-4">
          {errorMessage ? (
            <Alert variant="error" title="Order error" description={errorMessage} />
          ) : null}
          <CrudTable
            columns={columns}
            data={paginatedOrders}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            emptyState={
              <CrudEmptyState
                title="No orders yet."
                description="Create an order to generate an invoice record."
                actionLabel="Create Order"
                onAction={() => navigate('/orders/new')}
              />
            }
            actions={(row) => (
              <ActionMenu
                onView={() => navigate(`/orders/${row.id}`)}
                onEdit={() => navigate(`/orders/${row.id}/edit`)}
                customActions={[
                  {
                    label: 'Preview',
                    onClick: () => navigate(`/orders/${row.id}/preview`),
                  },
                ]}
              />
            )}
            page={page}
            pageCount={pageCount}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      }
    />
  );
}
