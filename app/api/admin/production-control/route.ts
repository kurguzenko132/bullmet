import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { defaultProductionControl, mergeProductionControl, productionControlKey } from '@/lib/productionControl';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!serverSupabase) return NextResponse.json({ settings: defaultProductionControl, configured: false });
  const { data, error } = await serverSupabase.from('site_settings').select('value').eq('key', productionControlKey).maybeSingle();
  if (error) return NextResponse.json({ settings: defaultProductionControl, error: error.message }, { status: 500 });
  return NextResponse.json({ settings: mergeProductionControl(data?.value || defaultProductionControl), configured: true });
}

export async function POST(request: NextRequest) {
  if (!serverSupabase) return NextResponse.json({ error: 'Supabase не подключен.' }, { status: 500 });
  const body = await request.json().catch(() => null); const settings = mergeProductionControl(body?.settings || body || defaultProductionControl);
  const { error } = await serverSupabase.from('site_settings').upsert({ key: productionControlKey, value: settings, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await serverSupabase.from('admin_activity_log').insert({ action: 'production_control_update', entity: 'site_settings', entity_id: productionControlKey, payload: { sections: ['hero', 'facts', 'structure', 'process', 'results'] } }).then(() => null);
  return NextResponse.json({ ok: true, settings });
}
