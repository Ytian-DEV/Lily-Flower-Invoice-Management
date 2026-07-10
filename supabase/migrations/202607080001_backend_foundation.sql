create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'staff');
create type public.invoice_status as enum ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'partially_paid', 'paid');
create type public.product_availability as enum ('available', 'unavailable');
create type public.payment_method as enum ('cash', 'gcash', 'bank_transfer', 'maribank');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  customer_code text not null unique,
  full_name text not null,
  phone_number text not null,
  delivery_address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id) on delete set null,
  product_name text not null,
  stem_count integer check (stem_count is null or stem_count >= 0),
  base_price numeric(12, 2) not null check (base_price >= 0),
  availability public.product_availability not null default 'available',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addons (
  id uuid primary key default gen_random_uuid(),
  addon_name text not null unique,
  price numeric(12, 2) not null check (price >= 0),
  availability public.product_availability not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null default 'Walk-in customer',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  discount_percent numeric(5, 2) not null default 0 check (discount_percent >= 0),
  discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  downpayment_amount numeric(12, 2) not null default 0 check (downpayment_amount >= 0),
  remaining_balance numeric(12, 2) not null default 0 check (remaining_balance >= 0),
  status public.invoice_status not null default 'pending',
  notes text,
  delivery_date date,
  delivery_address text,
  payment_method public.payment_method,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  total_price numeric(12, 2) not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

create table public.invoice_addons (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  addon_id uuid references public.addons(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  total_price numeric(12, 2) not null check (total_price >= 0)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  payment_method public.payment_method not null,
  amount numeric(12, 2) not null check (amount > 0),
  reference_number text,
  payment_status public.payment_status not null default 'pending',
  payment_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  image_url text not null,
  ocr_reference text,
  ocr_sender text,
  ocr_amount numeric(12, 2),
  ocr_date date,
  ocr_confidence numeric(5, 2),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  business_address text not null,
  phone_1 text not null,
  phone_2 text,
  facebook text,
  invoice_prefix text not null default 'INV',
  default_downpayment_percent numeric(5, 2) not null default 50 check (default_downpayment_percent >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_full_name_idx on public.customers using gin (to_tsvector('simple', full_name));
create index customers_phone_number_idx on public.customers (phone_number);
create index products_product_name_idx on public.products using gin (to_tsvector('simple', product_name));
create index invoices_invoice_number_idx on public.invoices (invoice_number);
create index invoices_status_idx on public.invoices (status);
create index invoices_delivery_date_idx on public.invoices (delivery_date);
create index invoices_created_at_idx on public.invoices (created_at);
create index payments_payment_status_idx on public.payments (payment_status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger customers_set_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger addons_set_updated_at before update on public.addons for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger settings_set_updated_at before update on public.settings for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.addons enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.invoice_addons enable row level security;
alter table public.payments enable row level security;
alter table public.payment_receipts enable row level security;
alter table public.settings enable row level security;

create policy "Authenticated users can read users" on public.users for select to authenticated using (true);
create policy "Users can update their profile" on public.users for update to authenticated using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

create policy "Authenticated users can manage customers" on public.customers for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage categories" on public.product_categories for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage products" on public.products for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage addons" on public.addons for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage invoices" on public.invoices for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage invoice items" on public.invoice_items for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage invoice addons" on public.invoice_addons for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage payments" on public.payments for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage payment receipts" on public.payment_receipts for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage settings" on public.settings for all to authenticated using (true) with check (true);
