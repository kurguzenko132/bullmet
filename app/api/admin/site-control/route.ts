import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { defaultSiteControl, mergeSiteControl, siteControlKey } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!serverSupabase) {
    return NextResponse.json({ settings: defaultSiteControl, source: 'defaults', configured: false });
  }

  const { data, error } = await serverSupabase
    .from('site_settings')
    .select('value')
    .eq('key', siteControlKey)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ settings: defaultSiteControl, source: 'defaults', configured: true, error: error.message });
  }

  return NextResponse.json({
    settings: mergeSiteControl(data?.value || defaultSiteControl),
    source: data?.value ? 'database' : 'defaults',
    configured: true
  });
}

export async function POST(request: NextRequest) {
  if (!serverSupabase) {
    return NextResponse.json({ error: 'Supabase не подключен.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const settings = mergeSiteControl(body?.settings || body || defaultSiteControl);

  const { error } = await serverSupabase
    .from('site_settings')
    .upsert({
      key: siteControlKey,
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await serverSupabase
    .from('admin_activity_log')
    .insert({
      action: 'site_control_update',
      entity: 'site_settings',
      entity_id: siteControlKey,
      payload: { sections: ['general', 'contacts', 'directions', 'navigation', 'seo'] }
    })
    .then(() => null);

  return NextResponse.json({ ok: true, settings });
}
