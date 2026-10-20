import {
  Button,
  StatusChip,
  type DataTableColumn,
  type StatusChipStatus,
} from '@/components/ui';
import { CrudTable } from '@/features/crud';
import type { DashboardInvoiceRow } from '@/features/dashboard/services/dashboardAnalytics';

function toStatusChipStatus(status: DashboardInvoiceRow['status']): StatusChipStatus {
  return status === 'out_for_delivery' ? 'out-for-delivery' : status;
}

const columns: DataTableColumn<DashboardInvoiceRow>[] = [
  { id: 'invoiceNumber', header: 'Invoice Number', accessor: 'invoiceNumber' },
  { id: 'customer', header: 'Customer', accessor: 'customer' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusChip status={toStatusChipStatus(row.status)} />,
  },
  { id: 'balance', header: 'Balance', accessor: 'balance', align: 'right' },
  { id: 'date', header: 'Date', accessor: 'date' },
];

interface RecentInvoicesTableProps {
  invoices: DashboardInvoiceRow[];
  onViewInvoice?: (invoiceId: string) => void;
}

export function RecentInvoicesTable({
  invoices,
  onViewInvoice,
}: RecentInvoicesTableProps) {
  return (
    <CrudTable
      columns={columns}
      data={invoices}
      getRowId={(row) => row.id}
      actions={(row) => (
        <Button variant="ghost" size="sm" onClick={() => onViewInvoice?.(row.id)}>
          View
        </Button>
      )}
    />
  );
}
