-- Placeholder records only. Replace with the owner's real catalog later.
insert into public.addons (addon_name, price, availability)
values ('Sample Add-on', 0, 'unavailable')
on conflict (addon_name) do nothing;
