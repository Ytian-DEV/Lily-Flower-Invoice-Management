import { supabase } from '@/lib/supabase';
import type { TableInsert, TableUpdate } from '@/types/database';

export const paymentReceiptsRepository = {
  create(payload: TableInsert<'payment_receipts'>) {
    return supabase.from('payment_receipts').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'payment_receipts'>) {
    return supabase
      .from('payment_receipts')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
  },
};

export const paymentsRepository = {
  list() {
    return supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
  },
  getById(id: string) {
    return supabase.from('payments').select('*').eq('id', id).single();
  },
  create(payload: TableInsert<'payments'>) {
    return supabase.from('payments').insert(payload).select('*').single();
  },
  update(id: string, payload: TableUpdate<'payments'>) {
    return supabase.from('payments').update(payload).eq('id', id).select('*').single();
  },
  remove(id: string) {
    return supabase.from('payments').delete().eq('id', id);
  },
  listByInvoice(invoiceId: string) {
    return supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: false });
  },
};
