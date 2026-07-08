insert into storage.buckets (id, name, public)
values
  ('receipts', 'receipts', false),
  ('products', 'products', false),
  ('exports', 'exports', false)
on conflict (id) do nothing;

create policy "Authenticated users can read receipt uploads"
on storage.objects for select to authenticated
using (bucket_id = 'receipts');

create policy "Authenticated users can upload receipts"
on storage.objects for insert to authenticated
with check (bucket_id = 'receipts');

create policy "Authenticated users can manage receipt uploads"
on storage.objects for update to authenticated
using (bucket_id = 'receipts')
with check (bucket_id = 'receipts');

create policy "Authenticated users can read product assets"
on storage.objects for select to authenticated
using (bucket_id = 'products');

create policy "Authenticated users can upload product assets"
on storage.objects for insert to authenticated
with check (bucket_id = 'products');

create policy "Authenticated users can read exports"
on storage.objects for select to authenticated
using (bucket_id = 'exports');

create policy "Authenticated users can upload exports"
on storage.objects for insert to authenticated
with check (bucket_id = 'exports');
