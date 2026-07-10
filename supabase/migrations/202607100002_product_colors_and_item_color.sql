alter table public.product_categories
  add column if not exists availability public.product_availability not null default 'available';

create table if not exists public.colors (
  id uuid primary key default gen_random_uuid(),
  color_name text not null unique,
  hex_color text not null,
  availability public.product_availability not null default 'available',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint colors_hex_color_check check (hex_color ~ '^#[0-9A-Fa-f]{6}$')
);

create table if not exists public.product_colors (
  product_id uuid not null references public.products(id) on delete cascade,
  color_id uuid not null references public.colors(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, color_id)
);

alter table public.invoice_items
  add column if not exists color_id uuid references public.colors(id) on delete set null,
  add column if not exists color_name text,
  add column if not exists custom_color_name text;

drop trigger if exists colors_set_updated_at on public.colors;
create trigger colors_set_updated_at
  before update on public.colors
  for each row execute function public.set_updated_at();

alter table public.colors enable row level security;
alter table public.product_colors enable row level security;

drop policy if exists "Authenticated users can manage colors" on public.colors;
create policy "Authenticated users can manage colors"
  on public.colors for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated users can manage product colors" on public.product_colors;
create policy "Authenticated users can manage product colors"
  on public.product_colors for all to authenticated using (true) with check (true);
