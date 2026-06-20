import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/serverSupabase';
import { getTelegramDiagnostics } from '@/lib/notifications';

export async function GET() {
  return NextResponse.json({
    ok: true,
    supabase: {
      configured: isSupabaseConfigured(),
      urlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      anonKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
    },
    telegram: getTelegramDiagnostics(),
    site: {
      url: process.env.NEXT_PUBLIC_SITE_URL || '',
      adminEmailConfigured: Boolean(process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAILS)
    }
  });
}
