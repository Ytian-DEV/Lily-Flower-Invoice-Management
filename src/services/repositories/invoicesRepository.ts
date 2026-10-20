import { supabase } from '@/lib/supabase';
import type {
  InvoiceStatus,
  PaymentMethod,
  TableRow,
  TableUpdate,
} from '@/types/database';

/** Order header fields; totals are computed by the database from the lines. */
export type OrderInvoicePayload = {
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  discount_percent: number;
  delivery_fee: number;
  status: InvoiceStatus;
  notes: string | null;
  delivery_date: string;
  delivery_address: string;
  payment_method?: PaymentMethod;
};

export type OrderItemPayload = {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  color_id: string | null;
  color_name: string | null;
  custom_color_name: string | null;
};

export type OrderAddonPayload = {
  addon_id: string | null;
  addon_name: string;
  quantity: number;
  unit_price: number;
};

export type OrderDownpaymentPayload = {
  downpayment_percent: number;
  payment_method: PaymentMethod;
  reference_number: string | null;
  receipt_path: string | null;
};

export interface OrderSavePayload {
  invoice: OrderInvoicePayload;
  items: OrderItemPayload[];
  addons: OrderAddonPayload[];
  payment?: OrderDownpaymentPayload;
}

export type InvoiceItemWithProduct = TableRow<'invoice_items'> & {
  products: { product_name: string | null } | null;
};

export type InvoiceAddonWithAddon = TableRow<'invoice_addons'> & {
  addons: { addon_name: string | null } | null;
};

export type InvoicePreviewPayment = Pick<
  TableRow<'payments'>,
  'id' | 'payment_method' | 'amount' | 'reference_number' | 'created_at' | 'payment_date'
> & {
  payment_receipts?: Pick<
    TableRow<'payment_receipts'>,
    'id' | 'image_url' | 'verified'
  >[];
};

export interface InvoicePreviewData {
  invoice: TableRow<'invoices'>;
  customer: TableRow<'customers'> | null;
  items: InvoiceItemWithProduct[];
  addons: InvoiceAddonWithAddon[];
  payments: InvoicePreviewPayment[];
}

export const invoicesRepository = {
  async getPreviewById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(
        `
          *,
          customers(*),
          invoice_items(*, products(product_name)),
          invoice_addons(*, addons(addon_name)),
          payments(id, payment_method, amount, reference_number, created_at, payment_date, payment_receipts(id, image_url, verified))
        `,
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      return { data: null, error };
    }

    const previewData: InvoicePreviewData = {
      invoice: data,
      customer: data.customers ?? null,
      items: data.invoice_items ?? [],
      addons: data.invoice_addons ?? [],
      payments: data.payments ?? [],
    };

    return { data: previewData, error: null };
  },

  update(id: string, payload: TableUpdate<'invoices'>) {
    return supabase.from('invoices').update(payload).eq('id', id).select('*').single();
  },

  createOrder({ addons, invoice, items, payment }: OrderSavePayload) {
    return supabase.rpc('create_order', {
      p_invoice: invoice,
      p_items: items,
      p_addons: addons,
      p_payment: payment ?? null,
    });
  },

  updateOrder(id: string, { addons, invoice, items }: Omit<OrderSavePayload, 'payment'>) {
    return supabase.rpc('update_order', {
      p_invoice_id: id,
      p_invoice: invoice,
      p_items: items,
      p_addons: addons,
    });
  },
};
