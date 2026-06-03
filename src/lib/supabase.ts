import { createClient } from '@supabase/supabase-js';

// SSR-safe Supabase client singleton
let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  console.log("getSupabaseClient called");
  console.log("import.meta.env =", import.meta.env);
  
  // If we already have a client, return it
  if (supabaseClient) {
    return supabaseClient;
  }

  // Only initialize on client-side
  if (typeof window === 'undefined') {
    console.log("Detected SSR, returning null");
    return null;
  }

  console.log("Client-side detected, initializing Supabase client");
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log("VITE_SUPABASE_URL =", supabaseUrl);
  console.log("VITE_SUPABASE_ANON_KEY =", supabaseAnonKey);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables');
    return null;
  }

  console.log("Creating Supabase client instance");
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  console.log('ENV URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('SUPABASE URL:', supabaseClient?.rest?.url);
  return supabaseClient;
};

// Export a reference that can be used, but always use getSupabaseClient()
export const supabase = getSupabaseClient();
