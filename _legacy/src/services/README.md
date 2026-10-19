Service abstractions for external systems and business workflows.

Feature components should use repositories from `src/services/repositories` instead of calling Supabase directly.

Storage helpers live in `src/services/storage` and currently prepare receipt uploads, product image uploads, and invoice export uploads.
