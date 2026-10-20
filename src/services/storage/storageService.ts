import { supabase } from '@/lib/supabase';

export type StorageBucket = 'receipts' | 'products' | 'exports';

export interface UploadFileOptions {
  bucket: StorageBucket;
  path: string;
  file: File;
  contentType?: string;
  upsert?: boolean;
}

const signedUrlLifetimeSeconds = 60 * 10;

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

export function removeFile(bucket: StorageBucket, path: string) {
  return supabase.storage.from(bucket).remove([path]);
}

export function getPublicUrl(bucket: StorageBucket, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path);
}

/** All buckets are private, so files are viewed through short-lived signed URLs. */
export function createSignedUrl(bucket: StorageBucket, path: string) {
  return supabase.storage.from(bucket).createSignedUrl(path, signedUrlLifetimeSeconds);
}

function fileExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase();

  if (fromName && /^[a-z0-9]{1,5}$/.test(fromName)) {
    return fromName;
  }

  return file.type.split('/')[1] ?? 'bin';
}

function storageObjectPath(folder: string, file: File) {
  return `${folder}/${crypto.randomUUID()}.${fileExtension(file)}`;
}

export function uploadReceipt(file: File, invoiceId: string) {
  return uploadFile({
    bucket: 'receipts',
    path: storageObjectPath(invoiceId, file),
    file,
    contentType: file.type,
  });
}

/**
 * Receipts are stored as bucket paths. Older rows saved a full public URL, which
 * never worked for the private bucket, so the path is recovered from it.
 */
export function receiptPathFromImageUrl(imageUrl: string) {
  if (!/^https?:\/\//.test(imageUrl)) {
    return imageUrl;
  }

  const marker = '/receipts/';
  const index = imageUrl.indexOf(marker);

  return index === -1
    ? imageUrl
    : decodeURIComponent(imageUrl.slice(index + marker.length));
}

export function uploadProductImage(file: File, productId: string) {
  return uploadFile({
    bucket: 'products',
    path: storageObjectPath(productId, file),
    file,
    contentType: file.type,
  });
}

export function uploadInvoiceExport(file: File, invoiceId: string) {
  return uploadFile({
    bucket: 'exports',
    path: storageObjectPath(invoiceId, file),
    file,
    contentType: file.type,
  });
}
