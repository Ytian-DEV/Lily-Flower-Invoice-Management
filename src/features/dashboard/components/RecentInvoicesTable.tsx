import { Button, StatusChip, type DataTableColumn } from '@/components/ui';
import { CrudTable } from '@/features/crud';
import type { DashboardInvoiceRow } from '@/mocks/dashboard';
import { recentInvoices } from '@/mocks/dashboard';

const columns: DataTableColumn<DashboardInvoiceRow>[] = [
  { id: 'invoiceNumber', header: 'Invoice Number', accessor: 'invoiceNumber' },
  { id: 'customer', header: 'Customer', accessor: 'customer' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusChip status={row.status} />,
  },
  { id: 'balance', header: 'Balance', accessor: 'balance', align: 'right' },
  { id: 'date', header: 'Date', accessor: 'date' },
];

export function RecentInvoicesTable() {
  return (
    <CrudTable
      columns={columns}
      data={recentInvoices}
      getRowId={(row) => row.id}
      actions={() => (
        <Button variant="ghost" size="sm">
          View
        </Button>
      )}
    />
  );
}
