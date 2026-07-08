-- Placeholder records only. Replace with the owner's real catalog later.
insert into public.product_categories (name, description, sort_order)
values ('Sample Category', 'Replace this category before production use.', 1)
on conflict (name) do nothing;
