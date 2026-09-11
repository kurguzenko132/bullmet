import { NextRequest, NextResponse } from 'next/server';
import { getAdminMediaFiles } from '@/lib/adminContent';
import { isSupabaseConfigured, serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const files = await getAdminMediaFiles();
    return NextResponse.json({ ok: true, configured: isSupabaseConfigured(), files });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: isSupabaseConfigured(), files: [], message: error instanceof Error ? error.message : 'Не удалось загрузить медиафайлы.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключён.' }, { status: 500 });
  const body = await request.json().catch(() => null);
  const url = String(body?.url || '').trim();
  if (!url) return NextResponse.json({ ok: false, message: 'Не указан URL загруженного файла.' }, { status: 400 });
  const payload = {
    url,
    title: String(body?.title || url.split('/').pop() || 'media'),
    folder: String(body?.folder || 'uploaded'),
    source: String(body?.source || 'admin upload'),
    used_in: '',
    size_bytes: Number(body?.size || 0) || null,
    mime_type: body?.mime_type ? String(body.mime_type) : null,
    width: Number(body?.width || 0) || null,
    height: Number(body?.height || 0) || null,
    alt_text: String(body?.alt_text || ''),
    description: String(body?.description || ''),
    tags: Array.isArray(body?.tags) ? body.tags.map(String) : []
  };
  const { data, error } = await serverSupabase.from('media_files').upsert(payload, { onConflict: 'url' }).select('*').single();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  await serverSupabase.from('admin_activity_log').insert({ action: 'media_upload', entity: 'media_files', entity_id: data.id, payload: { title: data.title, size: data.size_bytes } }).then(() => null);
  return NextResponse.json({ ok: true, file: data });
}
