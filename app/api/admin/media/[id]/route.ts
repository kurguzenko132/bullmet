import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { logAdminActivity } from '@/lib/adminActivity';
import { getAdminMediaFiles } from '@/lib/adminContent';

const allowed = ['title', 'folder', 'alt_text', 'description', 'tags'];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключён.' }, { status: 500 });
  const body = await request.json().catch(() => null);
  const patch = Object.fromEntries(Object.entries(body || {}).filter(([key]) => allowed.includes(key)));
  if (Array.isArray(patch.tags)) patch.tags = patch.tags.map(String);
  const { data: before, error: beforeError } = await serverSupabase.from('media_files').select('*').eq('id', id).maybeSingle();
  if (beforeError || !before) return NextResponse.json({ ok: false, message: 'Файл не найден.' }, { status: 404 });
  const { data, error } = await serverSupabase.from('media_files').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  const warning = await logAdminActivity(request, { action: 'media_update', entity: 'media_files', entityId: id, before, after: data, payload: { changedFields: Object.keys(patch) } });
  return NextResponse.json({ ok: true, file: data, warning: warning ? `Файл обновлён, но запись в журнал не добавлена: ${warning}` : undefined });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключён.' }, { status: 500 });
  const { data: before, error: beforeError } = await serverSupabase.from('media_files').select('*').eq('id', id).maybeSingle();
  if (beforeError || !before) return NextResponse.json({ ok: false, message: 'Файл не найден.' }, { status: 404 });
  const usage = (await getAdminMediaFiles()).find((file) => file.id === id || file.url === before.url)?.usage || [];
  if (usage.length) return NextResponse.json({ ok: false, message: `Файл используется в ${usage.length} местах. Сначала замените его в привязках.` }, { status: 409 });
  const storagePath = String(before.url || '').match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+?)(?:\?.*)?$/);
  if (storagePath) {
    const { error: storageError } = await serverSupabase.storage.from(storagePath[1]).remove([decodeURIComponent(storagePath[2])]);
    if (storageError) return NextResponse.json({ ok: false, message: 'Не удалось удалить физический объект из Storage.' }, { status: 500 });
  }
  const { error } = await serverSupabase.from('media_files').delete().eq('id', id);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  const warning = await logAdminActivity(request, { action: 'media_delete', entity: 'media_files', entityId: id, before });
  return NextResponse.json({ ok: true, warning: warning ? `Файл удалён, но запись в журнал не добавлена: ${warning}` : undefined });
}
