import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'CRM-база пока не подключена.' }, { status: 500 });
  const { data, error } = await serverSupabase.from('customer_notes').select('*').eq('customer_id', params.id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ ok: false, message: 'Не удалось загрузить заметки.' }, { status: 500 });
  return NextResponse.json({ ok: true, notes: data || [] });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'CRM-база пока не подключена.' }, { status: 500 });
  const body = await request.json().catch(() => null);
  const text = String(body?.text || '').trim();
  if (!text) return NextResponse.json({ ok: false, message: 'Введите текст заметки.' }, { status: 400 });
  const { data, error } = await serverSupabase.from('customer_notes').insert({ customer_id: params.id, text, created_by: 'Администратор' }).select('*').single();
  if (error) return NextResponse.json({ ok: false, message: 'Не удалось добавить заметку.' }, { status: 500 });
  await serverSupabase.from('admin_activity_log').insert({ action: 'customer_note_create', entity: 'customer', entity_id: params.id }).then(() => null);
  return NextResponse.json({ ok: true, note: data });
}
