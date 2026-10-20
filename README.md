# Lily Flowers — Orders & Invoices

Order, invoice and payment management for Lily Flowers, Baybay City. Staff create
orders, record downpayments and later payments, and print or share invoices.

Built with React 19, TypeScript, Tailwind CSS 4, TanStack Query and Supabase
(Postgres, Auth, Storage). Deployed on Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the two values below
npm run dev
```

| Variable                 | Where to find it                             |
| ------------------------ | -------------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase → Project settings → API → URL      |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project settings → API → anon key |

Only the public anon key belongs here. Never put the service-role key in a
`VITE_` variable — it would be shipped to every browser.

## Scripts

| Command             | What it does                                 |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the dev server                         |
| `npm run build`     | Type-check and build for production          |
| `npm run preview`   | Serve the production build locally           |
| `npm test`          | Run unit tests (pricing, formatting, search) |
| `npm run lint`      | ESLint                                       |
| `npm run typecheck` | TypeScript only                              |

## Database

Migrations live in `supabase/migrations` and must be applied in filename order
(Supabase CLI: `supabase db push`, or paste each file into the SQL editor).
See [supabase/README.md](supabase/README.md) for what each one does.

Key rules enforced by the database, not the browser:

- **Invoice numbers** are issued by `next_invoice_number()` — `PREFIX-YYYYMMDD-NNNN`
  on Manila time, using the prefix from Settings. They never collide.
- **Orders are saved atomically** through `create_order()` / `update_order()`:
  invoice, bouquets, add-ons, downpayment and receipt succeed or fail together.
  Totals are recalculated on the server from the line items.
- **Balances** (`remaining_balance`, `payment_state`) are kept in sync with the
  `payments` table by a trigger. Record payments with `record_payment()`.
- **Roles**: staff can create and edit everything; only admins can delete records
  and change Settings. The first user becomes admin automatically. To change a
  role: `update public.users set role = 'admin' where full_name = '…';`

## Project structure

```
src/
  app/            App root and providers
  components/
    layout/       App shell, sidebar, page container
    ui/           Shared design-system components (Button, DataTable, Modal…)
  features/       One folder per area, each with an api.ts of data hooks
    auth/  catalog/  customers/  dashboard/  orders/  payments/  settings/
  lib/            Supabase client, query cache, labels, search helpers
  pages/          One component per route
  routes/         Router, redirects for old URLs, idle prefetching
  services/       Thin Supabase repositories and receipt storage
  styles/         Tailwind theme tokens and print styles
  types/          Database types
  utils/          Formatting helpers (currency, dates, phone numbers)
  validation/     Zod schemas for forms
```

Data fetching goes through TanStack Query (`features/*/api.ts`): results are
cached, shared between pages, refetched in the background, and invalidated after
every save, so lists and the dashboard stay current without manual refreshes.

## Performance notes

- Each page is its own code-split chunk; the most-used pages are prefetched in
  idle time after the first screen loads. The PNG export library loads on demand.
- Lists are paginated and filtered on the server; searches are debounced and use
  trigram indexes.
- The dashboard is one SQL call (`dashboard_summary()`) instead of six table scans.
- Fonts are self-hosted; the logo ships as a 2 KB WebP (the original 2.4 MB PNG
  is kept in `design/` as the source file).
- Vercel serves hashed assets with a one-year immutable cache, compresses
  responses (Brotli/gzip) and serves them from its CDN. Supabase handles database
  connection pooling and load balancing on its side.

## Deployment (Vercel)

1. Import the repository in Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Environment Variables.
3. Build command `npm run build`, output directory `dist` (both set in `vercel.json`).

`vercel.json` also adds cache and security headers and rewrites app routes to
`index.html` so refreshing any page works.
