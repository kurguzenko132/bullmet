import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { defaultHomepageControl, homepageControlKey, mergeHomepageControl } from '@/lib/homepageControl';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!serverSupabase) {
    return NextResponse.json({ settings: defaultHomepageControl, source: 'defaults', configured: false });
  }

  const { data, error } = await serverSupabase
    .from('site_settings')
    .select('value')
    .eq('key', homepageControlKey)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ settings: defaultHomepageControl, source: 'defaults', configured: true, error: error.message });
  }

  return NextResponse.json({
    settings: mergeHomepageControl(data?.value || defaultHomepageControl),
    source: data?.value ? 'database' : 'defaults',
    configured: true
  });
}

export async function POST(request: NextRequest) {
  if (!serverSupabase) {
    return NextResponse.json({ error: 'Supabase не подключен.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const settings = mergeHomepageControl(body?.settings || body || defaultHomepageControl);

  const { error } = await serverSupabase
    .from('site_settings')
    .upsert({
      key: homepageControlKey,
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await serverSupabase
    .from('admin_activity_log')
    .insert({
      action: 'homepage_control_update',
      entity: 'site_settings',
      entity_id: homepageControlKey,
      payload: { sections: ['hero', 'directions', 'products', 'production', 'steps', 'gallery', 'cta'] }
    })
    .then(() => null);

  return NextResponse.json({ ok: true, settings });
}
