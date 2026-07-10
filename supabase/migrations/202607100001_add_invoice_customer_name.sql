alter table public.invoices
  add column if not exists customer_name text not null default 'Walk-in customer';

update public.invoices
set customer_name = coalesce(nullif(trim(customers.full_name), ''), 'Walk-in customer')
from public.customers
where public.invoices.customer_id = customers.id
  and public.invoices.customer_name = 'Walk-in customer';
