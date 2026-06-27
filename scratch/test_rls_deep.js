/**
 * Deep RLS test — verifies that:
 * 1. Anon UPDATE is silently filtered (no rows affected) by RLS, not truly succeeding
 * 2. The report remains is_public=true after the attempted anon UPDATE
 * 3. A private report is NOT fetchable by anon
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) { let v = (m[2] || '').trim(); env[m[1]] = v; }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const anonKey     = env.VITE_SUPABASE_ANON_KEY;
const anonClient  = createClient(supabaseUrl, anonKey);
const PUBLIC_ID   = 'cde96090-31f4-4f61-8a51-2d450cdc8a9b';

async function run() {
  // ── 1. Read is_public before attempted update ────────────────────────────
  console.log('=== Anon UPDATE RLS verification ===\n');
  const { data: before } = await anonClient.from('analyses').select('id, is_public').eq('id', PUBLIC_ID).single();
  console.log('BEFORE attempted anon UPDATE → is_public:', before?.is_public);

  // Anon client attempts to SET is_public=false (should be blocked by RLS)
  const { data: updData, error: updErr, count } = await anonClient
    .from('analyses')
    .update({ is_public: false })
    .eq('id', PUBLIC_ID)
    .select()   // ask Supabase to return affected rows
  console.log('UPDATE returned rows:', updData);
  console.log('UPDATE error:        ', updErr);

  // Re-read to see if value actually changed
  const { data: after } = await anonClient.from('analyses').select('id, is_public').eq('id', PUBLIC_ID).single();
  console.log('AFTER attempted anon UPDATE → is_public:', after?.is_public);
  console.log('RLS correctly blocked?', before?.is_public === after?.is_public && after?.is_public === true ? 'YES ✅' : 'NO ❌ — check RLS!');

  // ── 2. Find a private row (is_public=false) and verify anon cannot read it ─
  console.log('\n=== Verify anon cannot read private rows ===\n');

  // Fetch 5 most recent analyses using anonClient (no session) — should ONLY return is_public=true
  const { data: publicRows } = await anonClient.from('analyses').select('id, is_public').limit(10);
  const privateInResult = publicRows?.filter(r => !r.is_public) ?? [];
  console.log('Total rows anon can see:', publicRows?.length);
  console.log('Private rows in result (should be 0):', privateInResult.length, privateInResult.length === 0 ? '✅' : '❌');

  // ── 3. Verify report.$id loader path works end-to-end ────────────────────
  console.log('\n=== Simulate loader: fetchAnalysisById as anon ===\n');
  const { data: loaderData, error: loaderErr } = await anonClient
    .from('analyses')
    .select('*')
    .eq('id', PUBLIC_ID)
    .single();
  console.log('Loader data (public id):', loaderData ? `✅ Got ${loaderData.role}` : 'null');
  console.log('Loader error:           ', loaderErr);

  // ── 4. Try a non-existent / private ID ───────────────────────────────────
  console.log('\n=== Simulate loader with a non-public / wrong ID ===\n');
  const { data: missingData, error: missingErr } = await anonClient
    .from('analyses')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .single();
  console.log('Loader data (fake id):', missingData);
  console.log('Loader error code:    ', missingErr?.code, '— message:', missingErr?.message);

  console.log('\n=== Done ===');
}

run().catch(console.error);
