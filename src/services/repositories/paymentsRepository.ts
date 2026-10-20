import { supabase } from '@/lib/supabase';
import type { PaymentMethod, TableInsert, TableUpdate } from '@/types/database';

export type RecordPaymentPayload = {
  invoice_id: string;
  payment_method: PaymentMethod;
  amount: number;
  reference_number: string | null;
  payment_date: string;
  receipt_path: string | null;
};

export const paymentReceiptsRepository = {
  getByPaymentId(paymentId: string) {
    return supabase
      .from('payment_receipts')
      .select('*')
      .eq('payment_id', paymentId)
      .maybeSingle();
  },
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
  remove(id: string) {
    return supabase.from('payment_receipts').delete().eq('id', id);
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
  /** Inserts the payment and its receipt in one transaction; the invoice balance updates itself. */
  record(payload: RecordPaymentPayload) {
    return supabase.rpc('record_payment', { p_payment: payload });
  },
  listByInvoice(invoiceId: string) {
    return supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: false });
  },
};
