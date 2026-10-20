-- Atomic order saving, race-free invoice numbering, and payment-driven balances.
--
-- After this migration:
--   * Invoice numbers are issued by the database (prefix from settings, Manila date,
--     per-day counter), so concurrent orders can never collide.
--   * An order (invoice + bouquets + add-ons + downpayment + receipt) is written in
--     one transaction through create_order(); edits go through update_order().
--   * Totals are computed on the server from the line items.
--   * invoices.remaining_balance is kept in sync with payments by a trigger.
--   * invoices.downpayment_amount means the initial downpayment only.
--   * Line items keep a snapshot of the product / add-on name, so old invoices still
--     read correctly after a catalog item is renamed or deleted.
--   * Invoices keep the customer's phone number, including for walk-in customers.

-- 1. Name snapshots on line items ------------------------------------------------

alter table public.invoice_items add column if not exists product_name text;
alter table public.invoice_addons add column if not exists addon_name text;

update public.invoice_items as item
set product_name = product.product_name
from public.products as product
where item.product_id = product.id
  and item.product_name is null;

update public.invoice_addons as line
set addon_name = addon.addon_name
from public.addons as addon
where line.addon_id = addon.id
  and line.addon_name is null;

alter table public.invoices add column if not exists customer_phone text;

update public.invoices as invoice
set customer_phone = customer.phone_number
from public.customers as customer
where invoice.customer_id = customer.id
  and invoice.customer_phone is null;

-- 2. Constraints the client used to be trusted with ------------------------------

alter table public.invoices
  drop constraint if exists invoices_discount_percent_max_check;
alter table public.invoices
  add constraint invoices_discount_percent_max_check check (discount_percent <= 100);

create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id);
create index if not exists invoice_addons_invoice_id_idx on public.invoice_addons (invoice_id);
create index if not exists payments_invoice_id_idx on public.payments (invoice_id);
create index if not exists payment_receipts_payment_id_idx on public.payment_receipts (payment_id);
create index if not exists invoices_customer_id_idx on public.invoices (customer_id);

-- 3. Invoice numbering -----------------------------------------------------------

create table if not exists public.invoice_number_counters (
  invoice_date date primary key,
  last_value integer not null check (last_value >= 0)
);

-- No policies: only the security-definer function below touches this table.
alter table public.invoice_number_counters enable row level security;

-- Continue from the numbers already issued so the first new invoice of a day
-- does not reuse an existing sequence.
insert into public.invoice_number_counters (invoice_date, last_value)
select to_date(parts[1], 'YYYYMMDD'), max(parts[2]::integer)
from (
  select regexp_match(invoice_number, '(\d{8})-(\d+)$') as parts
  from public.invoices
) as issued
where parts is not null
group by parts[1]
on conflict (invoice_date) do update
  set last_value = greatest(public.invoice_number_counters.last_value, excluded.last_value);

create or replace function public.next_invoice_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_date date := (now() at time zone 'Asia/Manila')::date;
  v_sequence integer;
  v_prefix text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.' using errcode = '42501';
  end if;

  insert into invoice_number_counters as counter (invoice_date, last_value)
  values (v_date, 1)
  on conflict (invoice_date) do update set last_value = counter.last_value + 1
  returning last_value into v_sequence;

  select nullif(trim(invoice_prefix), '')
  into v_prefix
  from settings
  order by created_at
  limit 1;

  return format(
    '%s-%s-%s',
    upper(coalesce(v_prefix, 'INV')),
    to_char(v_date, 'YYYYMMDD'),
    lpad(v_sequence::text, 4, '0')
  );
end;
$$;

-- 4. Balance maintenance ---------------------------------------------------------

create or replace function public.refresh_invoice_balance(p_invoice_id uuid)
returns void
language sql
set search_path = public
as $$
  update invoices as invoice
  set remaining_balance = greatest(
    invoice.total_amount
      - coalesce((select sum(amount) from payments where invoice_id = invoice.id), 0),
    0
  )
  where invoice.id = p_invoice_id;
$$;

create or replace function public.payments_refresh_invoice_balance()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform refresh_invoice_balance(new.invoice_id);
  end if;

  if tg_op = 'DELETE' then
    perform refresh_invoice_balance(old.invoice_id);
  elsif tg_op = 'UPDATE' and old.invoice_id <> new.invoice_id then
    perform refresh_invoice_balance(old.invoice_id);
  end if;

  return null;
end;
$$;

drop trigger if exists payments_refresh_invoice_balance on public.payments;
create trigger payments_refresh_invoice_balance
  after insert or update or delete on public.payments
  for each row execute function public.payments_refresh_invoice_balance();

-- 5. Line items and totals -------------------------------------------------------

create or replace function public.write_invoice_lines(
  p_invoice_id uuid,
  p_items jsonb,
  p_addons jsonb
)
returns numeric
language plpgsql
set search_path = public
as $$
declare
  v_subtotal numeric(12, 2);
begin
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Add at least one bouquet.' using errcode = '22023';
  end if;

  delete from invoice_items where invoice_id = p_invoice_id;
  delete from invoice_addons where invoice_id = p_invoice_id;

  insert into invoice_items (
    invoice_id, product_id, product_name, quantity, unit_price, total_price,
    color_id, color_name, custom_color_name
  )
  select
    p_invoice_id,
    product.id,
    coalesce(product.product_name, nullif(trim(line.product_name), '')),
    line.quantity,
    round(line.unit_price, 2),
    round(line.quantity * line.unit_price, 2),
    line.color_id,
    nullif(trim(line.color_name), ''),
    nullif(trim(line.custom_color_name), '')
  from jsonb_to_recordset(p_items) as line(
    product_id uuid,
    product_name text,
    quantity integer,
    unit_price numeric,
    color_id uuid,
    color_name text,
    custom_color_name text
  )
  left join products as product on product.id = line.product_id;

  insert into invoice_addons (
    invoice_id, addon_id, addon_name, quantity, unit_price, total_price
  )
  select
    p_invoice_id,
    addon.id,
    coalesce(addon.addon_name, nullif(trim(line.addon_name), '')),
    line.quantity,
    round(line.unit_price, 2),
    round(line.quantity * line.unit_price, 2)
  from jsonb_to_recordset(coalesce(p_addons, '[]'::jsonb)) as line(
    addon_id uuid,
    addon_name text,
    quantity integer,
    unit_price numeric
  )
  left join addons as addon on addon.id = line.addon_id;

  select coalesce(sum(total_price), 0)
  into v_subtotal
  from (
    select total_price from invoice_items where invoice_id = p_invoice_id
    union all
    select total_price from invoice_addons where invoice_id = p_invoice_id
  ) as lines;

  return v_subtotal;
end;
$$;

create or replace function public.apply_invoice_totals(p_invoice_id uuid, p_subtotal numeric)
returns void
language plpgsql
set search_path = public
as $$
begin
  update invoices
  set
    subtotal = p_subtotal,
    discount_amount = round(p_subtotal * discount_percent / 100, 2),
    total_amount = greatest(
      p_subtotal - round(p_subtotal * discount_percent / 100, 2) + delivery_fee,
      0
    )
  where id = p_invoice_id;

  perform refresh_invoice_balance(p_invoice_id);
end;
$$;

-- 6. Public RPCs -----------------------------------------------------------------

create or replace function public.create_order(
  p_invoice jsonb,
  p_items jsonb,
  p_addons jsonb default '[]'::jsonb,
  p_payment jsonb default null
)
returns public.invoices
language plpgsql
set search_path = public
as $$
declare
  v_invoice_id uuid;
  v_total numeric(12, 2);
  v_amount numeric(12, 2);
  v_payment_id uuid;
  v_result invoices;
begin
  insert into invoices (
    invoice_number, customer_id, customer_name, customer_phone, discount_percent,
    delivery_fee, status, notes, delivery_date, delivery_address, payment_method
  )
  values (
    next_invoice_number(),
    nullif(p_invoice ->> 'customer_id', '')::uuid,
    coalesce(nullif(trim(p_invoice ->> 'customer_name'), ''), 'Walk-in customer'),
    nullif(trim(p_invoice ->> 'customer_phone'), ''),
    coalesce((p_invoice ->> 'discount_percent')::numeric, 0),
    coalesce((p_invoice ->> 'delivery_fee')::numeric, 0),
    coalesce(nullif(p_invoice ->> 'status', '')::invoice_status, 'pending'),
    nullif(trim(p_invoice ->> 'notes'), ''),
    nullif(p_invoice ->> 'delivery_date', '')::date,
    nullif(trim(p_invoice ->> 'delivery_address'), ''),
    nullif(p_invoice ->> 'payment_method', '')::payment_method
  )
  returning id into v_invoice_id;

  perform apply_invoice_totals(v_invoice_id, write_invoice_lines(v_invoice_id, p_items, p_addons));

  select total_amount into v_total from invoices where id = v_invoice_id;
  v_amount := round(
    v_total * least(greatest(coalesce((p_payment ->> 'downpayment_percent')::numeric, 0), 0), 100) / 100,
    2
  );

  if v_amount > 0 then
    insert into payments (
      invoice_id, payment_method, amount, reference_number, payment_status, payment_date
    )
    values (
      v_invoice_id,
      coalesce(nullif(p_payment ->> 'payment_method', '')::payment_method, 'cash'),
      v_amount,
      nullif(trim(p_payment ->> 'reference_number'), ''),
      case when v_amount >= v_total then 'paid'::payment_status else 'partially_paid'::payment_status end,
      (now() at time zone 'Asia/Manila')::date
    )
    returning id into v_payment_id;

    update invoices set downpayment_amount = v_amount where id = v_invoice_id;

    if nullif(p_payment ->> 'receipt_path', '') is not null then
      insert into payment_receipts (payment_id, image_url)
      values (v_payment_id, p_payment ->> 'receipt_path');
    end if;
  end if;

  select * into v_result from invoices where id = v_invoice_id;
  return v_result;
end;
$$;

create or replace function public.update_order(
  p_invoice_id uuid,
  p_invoice jsonb,
  p_items jsonb,
  p_addons jsonb default '[]'::jsonb
)
returns public.invoices
language plpgsql
set search_path = public
as $$
declare
  v_result invoices;
begin
  update invoices
  set
    customer_id = nullif(p_invoice ->> 'customer_id', '')::uuid,
    customer_name = coalesce(nullif(trim(p_invoice ->> 'customer_name'), ''), 'Walk-in customer'),
    customer_phone = nullif(trim(p_invoice ->> 'customer_phone'), ''),
    discount_percent = coalesce((p_invoice ->> 'discount_percent')::numeric, 0),
    delivery_fee = coalesce((p_invoice ->> 'delivery_fee')::numeric, 0),
    status = coalesce(nullif(p_invoice ->> 'status', '')::invoice_status, status),
    notes = nullif(trim(p_invoice ->> 'notes'), ''),
    delivery_date = nullif(p_invoice ->> 'delivery_date', '')::date,
    delivery_address = nullif(trim(p_invoice ->> 'delivery_address'), '')
  where id = p_invoice_id;

  if not found then
    raise exception 'Order not found.' using errcode = 'P0002';
  end if;

  perform apply_invoice_totals(p_invoice_id, write_invoice_lines(p_invoice_id, p_items, p_addons));

  select * into v_result from invoices where id = p_invoice_id;
  return v_result;
end;
$$;

create or replace function public.record_payment(p_payment jsonb)
returns public.payments
language plpgsql
set search_path = public
as $$
declare
  v_invoice_id uuid := (p_payment ->> 'invoice_id')::uuid;
  v_amount numeric(12, 2) := round((p_payment ->> 'amount')::numeric, 2);
  v_total numeric(12, 2);
  v_paid numeric(12, 2);
  v_result payments;
begin
  if v_amount is null or v_amount <= 0 then
    raise exception 'Enter a payment amount greater than zero.' using errcode = '22023';
  end if;

  -- Lock the invoice so two payments recorded at once see each other.
  select total_amount into v_total from invoices where id = v_invoice_id for update;

  if not found then
    raise exception 'Invoice not found.' using errcode = 'P0002';
  end if;

  select coalesce(sum(amount), 0) into v_paid from payments where invoice_id = v_invoice_id;

  insert into payments (
    invoice_id, payment_method, amount, reference_number, payment_status, payment_date
  )
  values (
    v_invoice_id,
    (p_payment ->> 'payment_method')::payment_method,
    v_amount,
    nullif(trim(p_payment ->> 'reference_number'), ''),
    case when v_paid + v_amount >= v_total then 'paid'::payment_status else 'partially_paid'::payment_status end,
    coalesce(nullif(p_payment ->> 'payment_date', '')::date, (now() at time zone 'Asia/Manila')::date)
  )
  returning * into v_result;

  if nullif(p_payment ->> 'receipt_path', '') is not null then
    insert into payment_receipts (payment_id, image_url)
    values (v_result.id, p_payment ->> 'receipt_path');
  end if;

  return v_result;
end;
$$;

-- 7. Function privileges ---------------------------------------------------------

revoke all on function public.next_invoice_number() from public, anon;
revoke all on function public.refresh_invoice_balance(uuid) from public, anon;
revoke all on function public.write_invoice_lines(uuid, jsonb, jsonb) from public, anon;
revoke all on function public.apply_invoice_totals(uuid, numeric) from public, anon;
revoke all on function public.create_order(jsonb, jsonb, jsonb, jsonb) from public, anon;
revoke all on function public.update_order(uuid, jsonb, jsonb, jsonb) from public, anon;
revoke all on function public.record_payment(jsonb) from public, anon;

grant execute on function public.next_invoice_number() to authenticated;
grant execute on function public.refresh_invoice_balance(uuid) to authenticated;
grant execute on function public.write_invoice_lines(uuid, jsonb, jsonb) to authenticated;
grant execute on function public.apply_invoice_totals(uuid, numeric) to authenticated;
grant execute on function public.create_order(jsonb, jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.update_order(uuid, jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.record_payment(jsonb) to authenticated;

-- 8. Receipt storage cleanup -----------------------------------------------------

-- Lets the app remove a receipt it uploaded when the order or payment save fails.
drop policy if exists "Authenticated users can delete receipt uploads" on storage.objects;
create policy "Authenticated users can delete receipt uploads"
on storage.objects for delete to authenticated
using (bucket_id = 'receipts');

-- 9. Repair existing data --------------------------------------------------------

-- The Payments page used to overwrite downpayment_amount with the running total
-- paid. Restore it to the payment recorded together with the order (within five
-- minutes of the invoice being created), or zero when there was none.
update public.invoices as invoice
set downpayment_amount = coalesce(
  (
    select payment.amount
    from public.payments as payment
    where payment.invoice_id = invoice.id
      and payment.created_at <= invoice.created_at + interval '5 minutes'
    order by payment.created_at
    limit 1
  ),
  0
);

update public.invoices as invoice
set remaining_balance = greatest(
  invoice.total_amount
    - coalesce((select sum(amount) from public.payments where invoice_id = invoice.id), 0),
  0
);
