import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

const looksLikeConfigured =
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  Boolean(supabaseAnonKey) &&
  !supabaseAnonKey.includes('your-') &&
  !supabaseUrl.includes('your-project-url');

export const isSupabaseConfigured = looksLikeConfigured;

export const supabase = looksLikeConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

export function getPublicStorageUrl(pathOrUrl?: string | null, bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images') {
  if (!pathOrUrl) return '';
  const value = String(pathOrUrl).trim();
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value;
  if (!supabase) return value;
  return supabase.storage.from(bucket).getPublicUrl(value).data.publicUrl;
}
