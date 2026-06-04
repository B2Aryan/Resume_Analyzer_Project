import { createClient } from '@supabase/supabase-js';

// SSR-safe Supabase client singleton
let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  // If we already have a client, return it
  if (supabaseClient) {
    return supabaseClient;
  }

  // Only initialize on client-side
  if (typeof window === 'undefined') {
    return null;
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

// Export a reference that can be used, but always use getSupabaseClient()
export const supabase = getSupabaseClient();
