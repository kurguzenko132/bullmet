import { NextRequest, NextResponse } from 'next/server';
import { bannerControlKey, defaultBannerControl, getBannerControlSettings, mergeBannerControl } from '@/lib/adminContent';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getBannerControlSettings();
  return NextResponse.json({ ok: true, settings, configured: Boolean(serverSupabase) });
}

export async function POST(request: NextRequest) {
  if (!serverSupabase) {
    return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const settings = mergeBannerControl(body?.settings || body || defaultBannerControl);

  const { error } = await serverSupabase
    .from('site_settings')
    .upsert({
      key: bannerControlKey,
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  await serverSupabase.from('admin_activity_log').insert({
    action: 'banner_control_update',
    entity: 'site_settings',
    entity_id: bannerControlKey,
    payload: { banners: settings.banners.length, enabled: settings.enabled }
  }).then(() => null);

  return NextResponse.json({ ok: true, settings });
}
