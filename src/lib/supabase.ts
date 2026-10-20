import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in the console instead of silently talking to a fake project.
  console.error(
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. See README → Environment.',
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'missing-anon-key',
);
