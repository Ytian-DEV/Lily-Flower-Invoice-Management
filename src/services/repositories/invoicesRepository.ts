import { supabase } from '@/lib/supabase';
import type {
  InvoiceStatus,
  PaymentMethod,
  TableInsert,
  TableRow,
  TableUpdate,
} from '@/types/database';

export interface InvoiceQuery {
  search?: string;
  status?: InvoiceStatus;
  page?: number;
  pageSize?: number;
}

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
>;

export interface InvoicePreviewData {
  invoice: TableRow<'invoices'>;
  customer: TableRow<'customers'> | null;
  items: InvoiceItemWithProduct[];
  addons: InvoiceAddonWithAddon[];
  payments: InvoicePreviewPayment[];
}

export const invoiceItemsRepository = {
  create(payload: TableInsert<'invoice_items'>) {
    return supabase.from('invoice_items').insert(payload).select('*').single();
  },
  remove(id: string) {
    return supabase.from('invoice_items').delete().eq('id', id);
  },
};

export const invoiceAddonsRepository = {
  create(payload: TableInsert<'invoice_addons'>) {
    return supabase.from('invoice_addons').insert(payload).select('*').single();
  },
  remove(id: string) {
    return supabase.from('invoice_addons').delete().eq('id', id);
  },
};

export const invoicesRepository = {
  list() {
    return supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
  },
  listWithCustomers() {
    return supabase
      .from('invoices')
      .select('*, customers(full_name, phone_number)')
      .order('created_at', { ascending: false });
  },
  getById(id: string) {
    return supabase.from('invoices').select('*').eq('id', id).single();
  },
  async getPreviewById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(
        `
          *,
          customers(*),
          invoice_items(*, products(product_name)),
          invoice_addons(*, addons(addon_name)),
          payments(id, payment_method, amount, reference_number, created_at, payment_date)
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
  create(payload: TableInsert<'invoices'>) {
    return supabase.from('invoices').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'invoices'>) {
    return supabase.from('invoices').update(payload).eq('id', id).select('*').single();
  },
  remove(id: string) {
    return supabase.from('invoices').delete().eq('id', id);
  },
  async removeIfAllowed(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('remaining_balance,total_amount')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error };
    }

    if (data.remaining_balance <= 0 && data.total_amount > 0) {
      return {
        data: null,
        error: {
          message: 'Paid invoices cannot be deleted by default.',
        },
      };
    }

    return supabase.from('invoices').delete().eq('id', id);
  },
  getByInvoiceNumber(invoiceNumber: string) {
    return supabase
      .from('invoices')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .single();
  },
  listByStatus(status: InvoiceStatus) {
    return supabase
      .from('invoices')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
  },
  query({ page = 1, pageSize = 10, search, status }: InvoiceQuery) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let request = supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      request = request.or(
        `invoice_number.ilike.%${search}%,delivery_address.ilike.%${search}%`,
      );
    }

    if (status) {
      request = request.eq('status', status);
    }

    return request;
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
