import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const serverSupabase = supabaseUrl && (serviceKey || anonKey)
  ? createClient(supabaseUrl, serviceKey || anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

export function isSupabaseConfigured() {
  return Boolean(serverSupabase);
}
