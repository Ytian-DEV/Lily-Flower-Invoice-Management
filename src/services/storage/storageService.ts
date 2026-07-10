import { supabase } from '@/lib/supabase';

export type StorageBucket = 'receipts' | 'products' | 'exports';

export interface UploadFileOptions {
  bucket: StorageBucket;
  path: string;
  file: File;
  contentType?: string;
  upsert?: boolean;
}

export function uploadFile({
  bucket,
  contentType,
  file,
  path,
  upsert = false,
}: UploadFileOptions) {
  return supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert,
  });
}

export function getPublicUrl(bucket: StorageBucket, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path);
}

export function uploadReceipt(file: File, paymentId: string) {
  return uploadFile({
    bucket: 'receipts',
    path: `${paymentId}/${crypto.randomUUID()}-${file.name}`,
    file,
    contentType: file.type,
  });
}

export function uploadProductImage(file: File, productId: string) {
  return uploadFile({
    bucket: 'products',
    path: `${productId}/${crypto.randomUUID()}-${file.name}`,
    file,
    contentType: file.type,
  });
}

export function uploadInvoiceExport(file: File, invoiceId: string) {
  return uploadFile({
    bucket: 'exports',
    path: `${invoiceId}/${crypto.randomUUID()}-${file.name}`,
    file,
    contentType: file.type,
  });
}
