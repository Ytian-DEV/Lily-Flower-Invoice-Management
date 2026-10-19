# Supabase

Apply the migrations in filename order. Each one is safe to re-run.

| Migration                                    | Purpose                                                                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `202607080001_backend_foundation`            | Tables, enums, base row-level security                                                                                                                       |
| `202607080002_storage_foundation`            | Private storage buckets                                                                                                                                      |
| `202607080003_addon_description`             | Add-on descriptions                                                                                                                                          |
| `202607100001_add_invoice_customer_name`     | Customer name stored on each invoice                                                                                                                         |
| `202607100002_product_colors_and_item_color` | Bouquet colors                                                                                                                                               |
| `202610190001_atomic_orders_and_numbering`   | Race-free invoice numbers, atomic `create_order` / `update_order` / `record_payment`, balance trigger, name and phone snapshots, repair of existing balances |
| `202610190002_roles_summaries_and_search`    | Profiles for every user, admin/staff permissions, `customer_summaries` view, `dashboard_summary()`, `payment_state` column, search indexes                   |

## After applying

1. Open **Authentication → Providers → Email** and turn off **Allow new users to
   sign up**. Staff accounts should be created by an admin from the Supabase
   dashboard (Authentication → Users → Add user).
2. Check **Table editor → users**: the first account is the admin. Promote others
   with `update public.users set role = 'admin' where full_name = '…';`
3. Fill in **Settings** in the app (shop details and invoice prefix).

## Seeds

`seeds/` contains placeholder catalog rows and default settings for a fresh
project. Replace them with the real catalog in the app.
