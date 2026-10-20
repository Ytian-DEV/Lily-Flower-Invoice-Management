import { supabase } from '@/lib/supabase';
import type { PaymentMethod } from '@/types/database';

export type RecordPaymentPayload = {
  invoice_id: string;
  payment_method: PaymentMethod;
  amount: number;
  reference_number: string | null;
  payment_date: string;
  receipt_path: string | null;
};

export const paymentsRepository = {
  /** Inserts the payment and its receipt in one transaction; the invoice balance updates itself. */
  record(payload: RecordPaymentPayload) {
    return supabase.rpc('record_payment', { p_payment: payload });
  },
};
