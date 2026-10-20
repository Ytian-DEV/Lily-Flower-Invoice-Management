import { Button, Card, CardBody, SectionHeader } from '@/components/ui';
import { DetailViewLayout } from '@/features/crud';
import type { Customer } from '@/features/customers/types';
import { formatCustomerDate } from '@/features/customers/utils/customerFormatters';

interface CustomerDetailsProps {
  customer: Customer;
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  return (
    <div className="space-y-6">
      <DetailViewLayout
        title={customer.full_name}
        description="Read-only customer details and future CRM metrics."
        sections={[
          {
            title: 'Customer Information',
            items: [
              { label: 'Customer Name', value: customer.full_name },
              { label: 'Phone Number', value: customer.phone_number },
              {
                label: 'Delivery Address',
                value: customer.delivery_address || 'No address',
              },
              { label: 'Notes', value: customer.notes || 'No notes' },
              { label: 'Created Date', value: formatCustomerDate(customer.created_at) },
              { label: 'Updated Date', value: formatCustomerDate(customer.updated_at) },
            ],
          },
          {
            title: 'Statistics',
            description: 'Prepared for invoices, payments, and purchase history.',
            items: [
              { label: 'Total Orders', value: '0' },
              { label: 'Total Purchases', value: 'PHP 0.00' },
              { label: 'Outstanding Balance', value: 'PHP 0.00' },
              { label: 'Last Order Date', value: 'Not available' },
            ],
          },
        ]}
      />
      <Card variant="outlined">
        <CardBody>
          <SectionHeader
            title="Quick Actions"
            description="Prepared for future invoice and payment modules."
            showDivider={false}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button disabled>Generate Invoice</Button>
            <Button variant="outline" disabled>
              View Orders
            </Button>
            <Button variant="outline" disabled>
              View Payments
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
