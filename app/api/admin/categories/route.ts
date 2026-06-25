import { NextRequest, NextResponse } from 'next/server';
import { catalogControlKey, defaultCatalogControl, getCatalogControlSettings, mergeCatalogControl } from '@/lib/catalogControl';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getCatalogControlSettings();
  return NextResponse.json({ ok: true, settings, configured: Boolean(serverSupabase) });
}

export async function POST(request: NextRequest) {
  if (!serverSupabase) {
    return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const settings = mergeCatalogControl(body?.settings || body || defaultCatalogControl);

  const { error } = await serverSupabase
    .from('site_settings')
    .upsert({
      key: catalogControlKey,
      value: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  await serverSupabase.from('admin_activity_log').insert({
    action: 'catalog_categories_update',
    entity: 'site_settings',
    entity_id: catalogControlKey,
    payload: { categories: settings.categories.length, enabled: settings.enabled }
  }).then(() => null);

  return NextResponse.json({ ok: true, settings });
}
