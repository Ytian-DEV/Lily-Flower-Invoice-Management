-- Roles, real customer statistics, a one-call dashboard summary, and fast search.
--
-- After this migration:
--   * Every auth user has a public.users profile (created automatically on sign-up).
--   * If nobody is an admin yet, the earliest profile becomes admin so the shop
--     owner is never locked out of Settings.
--   * Staff can create and edit records; only admins can delete records and change
--     business settings.
--   * customer_summaries exposes order count, outstanding balance and last order date.
--   * dashboard_summary() returns every dashboard number in one round trip,
--     computed over all rows on Manila time.
--   * invoices.payment_state can be filtered and sorted on directly.
--   * Trigram indexes make the "contains" searches used by the app fast.

-- 1. Profiles and roles -----------------------------------------------------------

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into users (auth_user_id, full_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, 'Staff'), '@', 1)
    )
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

insert into public.users (auth_user_id, full_name)
select
  auth_user.id,
  coalesce(
    nullif(trim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(auth_user.email, 'Staff'), '@', 1)
  )
from auth.users as auth_user
where not exists (
  select 1 from public.users as profile where profile.auth_user_id = auth_user.id
);

update public.users
set role = 'admin'
where id = (select id from public.users order by created_at limit 1)
  and not exists (select 1 from public.users where role = 'admin');

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from users where auth_user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

-- 2. Row level security: staff edit, admins delete and configure -----------------

do $$
declare
  shop_table text;
  managed_tables text[] := array[
    'customers', 'product_categories', 'colors', 'products', 'product_colors',
    'addons', 'invoices', 'invoice_items', 'invoice_addons', 'payments',
    'payment_receipts'
  ];
  -- Line tables are rewritten wholesale when an order is edited, so staff
  -- must be able to delete from them.
  staff_delete_tables text[] := array[
    'product_colors', 'invoice_items', 'invoice_addons', 'payment_receipts'
  ];
  old_policy record;
begin
  foreach shop_table in array managed_tables loop
    for old_policy in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = shop_table
    loop
      execute format('drop policy %I on public.%I', old_policy.policyname, shop_table);
    end loop;

    execute format(
      'create policy "Staff can read %1$s" on public.%1$I for select to authenticated using (true)',
      shop_table
    );
    execute format(
      'create policy "Staff can add %1$s" on public.%1$I for insert to authenticated with check (true)',
      shop_table
    );
    execute format(
      'create policy "Staff can edit %1$s" on public.%1$I for update to authenticated using (true) with check (true)',
      shop_table
    );

    if shop_table = any (staff_delete_tables) then
      execute format(
        'create policy "Staff can remove %1$s" on public.%1$I for delete to authenticated using (true)',
        shop_table
      );
    else
      execute format(
        'create policy "Admins can delete %1$s" on public.%1$I for delete to authenticated using (public.is_admin())',
        shop_table
      );
    end if;
  end loop;
end;
$$;

drop policy if exists "Authenticated users can manage settings" on public.settings;
drop policy if exists "Staff can read settings" on public.settings;
drop policy if exists "Admins can add settings" on public.settings;
drop policy if exists "Admins can edit settings" on public.settings;
create policy "Staff can read settings" on public.settings
  for select to authenticated using (true);
create policy "Admins can add settings" on public.settings
  for insert to authenticated with check (public.is_admin());
create policy "Admins can edit settings" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Only one settings row is ever used; enforce it.
create unique index if not exists settings_single_row_idx on public.settings ((true));

-- 3. Payment state --------------------------------------------------------------

alter table public.invoices
  add column if not exists payment_state text generated always as (
    case
      when total_amount - remaining_balance <= 0 then 'unpaid'
      when remaining_balance <= 0 then 'paid'
      else 'partially_paid'
    end
  ) stored;

create index if not exists invoices_payment_state_idx on public.invoices (payment_state);

-- 4. Customer summaries --------------------------------------------------------

create or replace view public.customer_summaries
with (security_invoker = true)
as
select
  customer.*,
  count(invoice.id)::integer as order_count,
  coalesce(
    sum(invoice.remaining_balance) filter (where invoice.status <> 'cancelled'),
    0
  )::numeric(12, 2) as outstanding_balance,
  max(invoice.created_at) as last_order_at
from public.customers as customer
left join public.invoices as invoice on invoice.customer_id = customer.id
group by customer.id;

grant select on public.customer_summaries to authenticated;

-- 5. Dashboard summary ----------------------------------------------------------

create or replace function public.dashboard_summary()
returns jsonb
language sql
stable
set search_path = public
as $$
  with bounds as (
    select
      (now() at time zone 'Asia/Manila')::date as today,
      date_trunc('month', now() at time zone 'Asia/Manila')::date as month_start
  ),
  active as (
    select * from invoices where status <> 'cancelled'
  )
  select jsonb_build_object(
    'today_orders', (
      select count(*) from invoices, bounds
      where (created_at at time zone 'Asia/Manila')::date = bounds.today
    ),
    'open_orders', (
      select count(*) from active where status <> 'completed'
    ),
    'month_revenue', (
      select coalesce(sum(amount), 0) from payments, bounds
      where payment_date >= bounds.month_start
    ),
    'previous_month_revenue', (
      select coalesce(sum(amount), 0) from payments, bounds
      where payment_date >= (bounds.month_start - interval '1 month')::date
        and payment_date < bounds.month_start
    ),
    'outstanding_balance', (
      select coalesce(sum(remaining_balance), 0) from active
    ),
    'unpaid_orders', (
      select count(*) from active where remaining_balance > 0
    ),
    'deliveries_next_7_days', (
      select count(*) from active, bounds
      where status <> 'completed'
        and delivery_date between bounds.today and bounds.today + 6
    ),
    'monthly_revenue', (
      select coalesce(jsonb_agg(jsonb_build_object('month', to_char(month, 'YYYY-MM'), 'total', total) order by month), '[]'::jsonb)
      from (
        select series.month, coalesce(sum(payment.amount), 0) as total
        from bounds,
          generate_series(
            (bounds.month_start - interval '5 months')::date,
            bounds.month_start,
            interval '1 month'
          ) as series(month)
        left join payments as payment
          on date_trunc('month', payment.payment_date) = series.month
        group by series.month
      ) as months
    ),
    'top_bouquets', (
      select coalesce(jsonb_agg(jsonb_build_object('name', name, 'quantity', quantity) order by quantity desc), '[]'::jsonb)
      from (
        select coalesce(item.product_name, 'Bouquet') as name, sum(item.quantity) as quantity
        from invoice_items as item
        join active as invoice on invoice.id = item.invoice_id, bounds
        where invoice.created_at >= bounds.today - 90
        group by 1
        order by 2 desc
        limit 5
      ) as top
    ),
    'status_counts', (
      select coalesce(jsonb_object_agg(status, total), '{}'::jsonb)
      from (select status, count(*) as total from invoices group by status) as counts
    )
  );
$$;

revoke all on function public.dashboard_summary() from public, anon;
grant execute on function public.dashboard_summary() to authenticated;

-- 6. Search indexes -------------------------------------------------------------

create extension if not exists pg_trgm with schema extensions;

create index if not exists invoices_search_number_trgm_idx
  on public.invoices using gin (invoice_number extensions.gin_trgm_ops);
create index if not exists invoices_search_customer_trgm_idx
  on public.invoices using gin (customer_name extensions.gin_trgm_ops);
create index if not exists customers_search_name_trgm_idx
  on public.customers using gin (full_name extensions.gin_trgm_ops);
create index if not exists customers_search_phone_trgm_idx
  on public.customers using gin (phone_number extensions.gin_trgm_ops);
create index if not exists products_search_name_trgm_idx
  on public.products using gin (product_name extensions.gin_trgm_ops);

-- Replaced by the trigram indexes above / the unique constraint on invoice_number.
drop index if exists public.customers_full_name_idx;
drop index if exists public.products_product_name_idx;
drop index if exists public.invoices_invoice_number_idx;

create index if not exists payments_payment_date_idx on public.payments (payment_date desc);
