/**
 * RLS Policy Verification Script
 * Tests what the anon key can and cannot fetch from Supabase.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env manually
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) {
    let v = (m[2] || '').trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const anonKey     = env.VITE_SUPABASE_ANON_KEY;
const serviceKey  = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== RLS Verification Script ===\n');
console.log('Supabase URL:     ', supabaseUrl);
console.log('Anon key prefix:  ', anonKey?.substring(0, 20) + '...');
console.log('Service key set?  ', serviceKey && !serviceKey.includes('YOUR_') ? 'YES' : 'NO (placeholder)');
console.log('');

// ── Client 1: Anon (no session) ──────────────────────────────────────────────
const anonClient = createClient(supabaseUrl, anonKey);

const PUBLIC_ID   = 'cde96090-31f4-4f61-8a51-2d450cdc8a9b'; // is_public = true (set by browser subagent earlier)

async function run() {
  // 1) Fetch public report as anon
  console.log('TEST 1: Fetch PUBLIC report with anon key (no auth)');
  {
    const { data, error } = await anonClient
      .from('analyses')
      .select('id, role, is_public')
      .eq('id', PUBLIC_ID)
      .single();
    console.log('  data :', data);
    console.log('  error:', error);
  }

  // 2) Fetch a non-public (private) report as anon — should be blocked by RLS
  console.log('\nTEST 2: List ALL analyses as anon (should return only is_public=true rows)');
  {
    const { data, error } = await anonClient
      .from('analyses')
      .select('id, is_public')
      .limit(5);
    console.log('  rows returned:', data?.length ?? 0);
    console.log('  all public?  ', data?.every(r => r.is_public) ?? 'N/A');
    console.log('  error        :', error);
  }

  // 3) Now mark that report private and re-fetch as anon
  console.log('\nTEST 3: Mark report private using the anonClient (simulating owner), then re-fetch as anon');
  {
    // Use a fresh anon client — still unauthenticated, update should fail (or be blocked by RLS)
    const { error: updateError } = await anonClient
      .from('analyses')
      .update({ is_public: false })
      .eq('id', PUBLIC_ID);
    console.log('  update as anon (expected failure):', updateError?.message ?? 'NO ERROR (unexpected!)');

    // Now fetch with normal anon — if still public, we'll see it; if private, we should not
    const { data, error } = await anonClient
      .from('analyses')
      .select('id, is_public')
      .eq('id', PUBLIC_ID)
      .single();
    console.log('  re-fetch data :', data);
    console.log('  re-fetch error:', error?.code, error?.message);
  }

  // 4) Check whether the TanStack loader would succeed server-side (window undefined)
  console.log('\nTEST 4: Simulate server-side environment (import.meta.env unavailable)');
  const serverUrl  = process.env.VITE_SUPABASE_URL  || supabaseUrl;
  const serverAnon = process.env.VITE_SUPABASE_ANON_KEY || anonKey;
  const serverClient = createClient(serverUrl, serverAnon);
  {
    const { data, error } = await serverClient
      .from('analyses')
      .select('id, role, is_public')
      .eq('id', PUBLIC_ID)
      .single();
    console.log('  data :', data ? `id=${data.id} is_public=${data.is_public}` : null);
    console.log('  error:', error);
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);
