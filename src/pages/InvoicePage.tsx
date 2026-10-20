import { useRef, useState } from 'react';
import { ImageDown, Printer } from 'lucide-react';
import { useParams } from 'react-router';

import { PageContainer } from '@/components/layout/PageContainer';
import { Button, ErrorState, LoadingScreen, PageHeader, useToast } from '@/components/ui';
import { useOrder } from '@/features/orders/api';
import { InvoiceDocument } from '@/features/orders/components/InvoiceDocument';
import { useSettings } from '@/features/settings/api';

export function InvoicePage() {
  const { id = '' } = useParams();
  const { showToast } = useToast();
  const order = useOrder(id);
  const settings = useSettings();
  const invoiceRef = useRef<HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (order.isPending || settings.isPending) {
    return <LoadingScreen label="Preparing invoice" />;
  }

  if (order.isError) {
    return (
      <PageContainer size="narrow">
        <ErrorState
          title="This invoice could not be loaded"
          description={order.error.message}
          onRetry={() => order.refetch()}
        />
      </PageContainer>
    );
  }

  const { addons, customer, invoice, items, payments } = order.data;

  const downloadImage = async () => {
    if (!invoiceRef.current) {
      return;
    }

    setIsExporting(true);

    try {
      // Loaded on demand: the image library is only needed when someone exports.
      const { exportInvoicePng } =
        await import('@/features/orders/utils/exportInvoicePng');
      await exportInvoicePng(invoiceRef.current, `${invoice.invoice_number}.png`);
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Image could not be created',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer size="narrow">
      <div className="print:hidden">
        <PageHeader
          back={{ to: `/orders/${invoice.id}`, label: invoice.invoice_number }}
          title="Invoice"
          description="Print it, save it as a PDF from the print dialog, or download an image for Messenger."
          actions={
            <>
              <Button
                variant="secondary"
                isLoading={isExporting}
                leftIcon={<ImageDown aria-hidden="true" className="size-4" />}
                onClick={downloadImage}
              >
                Download image
              </Button>
              <Button
                leftIcon={<Printer aria-hidden="true" className="size-4" />}
                onClick={() => window.print()}
              >
                Print or save PDF
              </Button>
            </>
          }
        />
      </div>
      <div className="invoice-preview-shell">
        <InvoiceDocument
          ref={invoiceRef}
          order={invoice}
          customer={customer}
          items={items}
          addons={addons}
          payments={payments}
          settings={settings.data ?? null}
        />
      </div>
    </PageContainer>
  );
}
