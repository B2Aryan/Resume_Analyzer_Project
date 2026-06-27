import { createClient } from '@supabase/supabase-js';

// Supabase anon client singleton.
// Safe for both browser and SSR (server-side route loaders).
// Uses the anon key only — never the service role key.
// VITE_* env vars are statically inlined by Vite into both client and server
// bundles, so import.meta.env is available in server-side loaders.
let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  // Return cached instance if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables');
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
};
