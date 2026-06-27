import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) { let v = (m[2] || '').trim(); env[m[1]] = v; }
});

const anonClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// Fetch some analyses — anon can only see is_public=true ones
const { data } = await anonClient.from('analyses').select('id, is_public').limit(10);
console.log('Public rows anon can see:', data?.map(r => ({id: r.id, is_public: r.is_public})));

// Try to fetch an ID that we know exists but is_public=false by testing 
// the ID from the public one and then seeing what the anon client does when
// we deliberately test a private-looking ID approach
// Let's get the public ID we've been using and see if unsharing it then blocks access
const PUBLIC_ID = 'cde96090-31f4-4f61-8a51-2d450cdc8a9b';
console.log('\nPublic rows visible include our test ID?', data?.some(r => r.id === PUBLIC_ID));
