# Lily Flower Invoice Management

Internal management system foundation for Lily Flowers - Baybay City Branch.

## Environment

Create `.env.local` for local development and configure the Supabase project values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Only public Vite variables should use the `VITE_` prefix. Do not commit real
service-role keys or private secrets.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Production Build

The app is built with Vite and React route-level lazy loading. Production assets
are emitted to `dist/`.

```bash
npm run build
```

## Vercel Deployment

1. Create a Vercel project from this repository.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project
   settings.
3. Use the default install command `npm install`.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.

`vercel.json` rewrites all routes to `index.html` so protected React routes work
after refresh.

## Production Notes

- Dashboard analytics use Supabase reads and refresh every minute.
- Runtime UI failures are caught by the app-level error boundary.
- SEO, manifest, robots, sitemap, and favicon placeholders are included even
  though the app is internal.
- Future monitoring, reporting, and notification hooks should be added through
  feature-level services to keep page components lean.
