import { supabase } from '@/lib/supabase';
import type { OrderAddonItem, OrderProductItem } from '@/features/orders/types';
import { createInvoiceNumber } from '@/features/orders/utils/invoiceNumber';
import type { InvoiceStatus, TableInsert, TableUpdate } from '@/types/database';

export interface InvoiceQuery {
  search?: string;
  status?: InvoiceStatus;
  page?: number;
  pageSize?: number;
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
  getById(id: string) {
    return supabase.from('invoices').select('*').eq('id', id).single();
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
  async generateInvoiceNumber() {
    const today = new Date();
    const prefix = `INV-${today.toISOString().slice(0, 10).replaceAll('-', '')}`;
    const { count, error } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .like('invoice_number', `${prefix}-%`);

    if (error) {
      return { invoiceNumber: '', error };
    }

    return { invoiceNumber: createInvoiceNumber((count ?? 0) + 1, today), error: null };
  },
  async createOrder(
    invoice: TableInsert<'invoices'>,
    products: OrderProductItem[],
    addons: OrderAddonItem[],
  ) {
    const invoiceResult = await supabase
      .from('invoices')
      .insert(invoice)
      .select('*')
      .single();

    if (invoiceResult.error) {
      return invoiceResult;
    }

    const invoiceId = invoiceResult.data.id;
    const itemPayload: TableInsert<'invoice_items'>[] = products.map((item) => ({
      invoice_id: invoiceId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
    }));
    const addonPayload: TableInsert<'invoice_addons'>[] = addons.map((item) => ({
      invoice_id: invoiceId,
      addon_id: item.addonId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
    }));

    if (itemPayload.length > 0) {
      const itemResult = await supabase.from('invoice_items').insert(itemPayload);

      if (itemResult.error) {
        return { data: null, error: itemResult.error };
      }
    }

    if (addonPayload.length > 0) {
      const addonResult = await supabase.from('invoice_addons').insert(addonPayload);

      if (addonResult.error) {
        return { data: null, error: addonResult.error };
      }
    }

    return invoiceResult;
  },
};
