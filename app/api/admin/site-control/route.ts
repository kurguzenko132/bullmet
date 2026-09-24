import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { defaultSiteControl, mergeSiteControl, siteControlKey } from '@/lib/siteControl';
import { getSiteSettingsRevision, saveSiteSettings, siteSettingsConflictResponse, withSiteSettingsRevision } from '@/lib/siteSettingsConcurrency';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!serverSupabase) {
    return NextResponse.json({ settings: defaultSiteControl, source: 'defaults', configured: false });
  }

  const { data, error } = await serverSupabase
    .from('site_settings')
    .select('value, updated_at')
    .eq('key', siteControlKey)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ settings: defaultSiteControl, source: 'defaults', configured: true, error: error.message });
  }

  return NextResponse.json({
    settings: withSiteSettingsRevision(mergeSiteControl(data?.value || defaultSiteControl), data?.updated_at),
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
  const result = await saveSiteSettings(siteControlKey, settings, getSiteSettingsRevision(body?.settings || body));

  if (!result.ok) return NextResponse.json(result.conflict ? siteSettingsConflictResponse() : { ok: false, message: result.message, error: result.message }, { status: result.conflict ? 409 : 500 });

  await serverSupabase
    .from('admin_activity_log')
    .insert({
      action: 'site_control_update',
      entity: 'site_settings',
      entity_id: siteControlKey,
      payload: { sections: ['general', 'contacts', 'directions', 'navigation', 'seo', 'commerce'] }
    })
    .then(() => null);

  return NextResponse.json({ ok: true, settings: withSiteSettingsRevision(settings, result.revision) });
}
