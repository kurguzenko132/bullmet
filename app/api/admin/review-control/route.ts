import { NextRequest, NextResponse } from 'next/server';
import { defaultReviewControl, getReviewControlSettings, mergeReviewControl, reviewControlKey } from '@/lib/reviewControl';
import { serverSupabase } from '@/lib/serverSupabase';
import { getSiteSettingsRevision, saveSiteSettings, siteSettingsConflictResponse, withSiteSettingsRevision } from '@/lib/siteSettingsConcurrency';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true, settings: await getReviewControlSettings(), configured: Boolean(serverSupabase) });
}

export async function POST(request: NextRequest) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });

  const body = await request.json().catch(() => null);
  const settings = mergeReviewControl(body?.settings || body || defaultReviewControl);
  const result = await saveSiteSettings(reviewControlKey, settings, getSiteSettingsRevision(body?.settings || body));

  if (!result.ok) return NextResponse.json(result.conflict ? siteSettingsConflictResponse() : { ok: false, message: result.message, error: result.message }, { status: result.conflict ? 409 : 500 });

  await serverSupabase.from('admin_activity_log').insert({
    action: 'review_control_update',
    entity: 'site_settings',
    entity_id: reviewControlKey,
    payload: settings
  }).then(() => null);

  return NextResponse.json({ ok: true, settings: withSiteSettingsRevision(settings, result.revision) });
}
