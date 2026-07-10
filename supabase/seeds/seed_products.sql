-- Placeholder records only. Replace with the owner's real catalog later.
insert into public.products (category_id, product_name, stem_count, base_price, availability, description)
select id, 'Sample Bouquet', 12, 0, 'unavailable', 'Replace this product before production use.'
from public.product_categories
where name = 'Sample Category'
on conflict do nothing;
