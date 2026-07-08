import { supabase } from '@/lib/supabase';
import type { InvoiceStatus, TableInsert, TableUpdate } from '@/types/database';

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
};
