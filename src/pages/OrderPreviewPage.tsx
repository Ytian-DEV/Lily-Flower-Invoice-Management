import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Download, FileImage, Printer } from 'lucide-react';

import { Button, LoadingScreen } from '@/components/ui';
import { CrudPageContainer } from '@/features/crud';
import { InvoiceDocument } from '@/features/orders/components/InvoiceDocument';
import { exportInvoicePng } from '@/features/orders/utils/exportInvoicePng';
import type { TableRow } from '@/types/database';
import type { Order } from '@/features/orders';
import {
  invoicesRepository,
  type InvoiceAddonWithAddon,
  type InvoiceItemWithProduct,
  type InvoicePreviewPayment,
} from '@/services/repositories/invoicesRepository';
import { settingsRepository } from '@/services/repositories/settingsRepository';

export function OrderPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLElement>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<TableRow<'customers'> | null>(null);
  const [items, setItems] = useState<InvoiceItemWithProduct[]>([]);
  const [addons, setAddons] = useState<InvoiceAddonWithAddon[]>([]);
  const [payments, setPayments] = useState<InvoicePreviewPayment[]>([]);
  const [settings, setSettings] = useState<TableRow<'settings'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPng, setIsExportingPng] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    const invoiceId = id;

    async function loadInvoice() {
      const [{ data: invoiceData }, { data: settingsData }] = await Promise.all([
        invoicesRepository.getPreviewById(invoiceId),
        settingsRepository.getActive(),
      ]);

      setOrder(invoiceData?.invoice ?? null);
      setCustomer(invoiceData?.customer ?? null);
      setItems(invoiceData?.items ?? []);
      setAddons(invoiceData?.addons ?? []);
      setPayments(invoiceData?.payments ?? []);
      setSettings(settingsData ?? null);
      setIsLoading(false);
    }

    loadInvoice();
  }, [id]);

  if (isLoading) {
    return <LoadingScreen text="Loading invoice preview..." />;
  }

  if (!order) {
    return (
      <CrudPageContainer
        title="Invoice Not Found"
        subtitle="The requested invoice could not be loaded."
        primaryAction={
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        }
      />
    );
  }

  const handleExportPng = async () => {
    if (!invoiceRef.current) {
      return;
    }

    setIsExportingPng(true);

    try {
      await exportInvoicePng(invoiceRef.current, `${order.invoice_number}.png`);
    } finally {
      setIsExportingPng(false);
    }
  };

  return (
    <CrudPageContainer
      title="Invoice Preview"
      subtitle="Printable invoice rendering and browser export preview."
      primaryAction={
        <Button leftIcon={<Printer className="size-4" />} onClick={() => window.print()}>
          Print
        </Button>
      }
      secondaryAction={
        <div className="flex flex-wrap gap-3 print:hidden">
          <Button
            variant="outline"
            leftIcon={<Download className="size-4" />}
            onClick={() => window.print()}
          >
            Export PDF
          </Button>
          <Button
            variant="outline"
            leftIcon={<FileImage className="size-4" />}
            isLoading={isExportingPng}
            onClick={handleExportPng}
          >
            Export PNG
          </Button>
        </div>
      }
      tableSlot={
        <div className="invoice-preview-shell bg-white p-4 text-slate-950 print:p-0">
          <InvoiceDocument
            ref={invoiceRef}
            order={order}
            customer={customer}
            items={items}
            addons={addons}
            payments={payments}
            settings={settings}
          />
        </div>
      }
    />
  );
}
