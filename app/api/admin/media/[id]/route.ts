import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';

const allowed = ['title', 'folder', 'alt_text', 'description', 'tags'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключён.' }, { status: 500 });
  const body = await request.json().catch(() => null);
  const patch = Object.fromEntries(Object.entries(body || {}).filter(([key]) => allowed.includes(key)));
  if (Array.isArray(patch.tags)) patch.tags = patch.tags.map(String);
  const { data, error } = await serverSupabase.from('media_files').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', params.id).select('*').single();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  await serverSupabase.from('admin_activity_log').insert({ action: 'media_update', entity: 'media_files', entity_id: params.id, payload: Object.keys(patch) }).then(() => null);
  return NextResponse.json({ ok: true, file: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключён.' }, { status: 500 });
  const { error } = await serverSupabase.from('media_files').delete().eq('id', params.id);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  await serverSupabase.from('admin_activity_log').insert({ action: 'media_delete', entity: 'media_files', entity_id: params.id, payload: {} }).then(() => null);
  return NextResponse.json({ ok: true });
}
