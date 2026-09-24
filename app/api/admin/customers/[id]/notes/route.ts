import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { logAdminActivity } from '@/lib/adminActivity';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'CRM-база пока не подключена.' }, { status: 500 });
  const { data, error } = await serverSupabase.from('customer_notes').select('*').eq('customer_id', id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ ok: false, message: 'Не удалось загрузить заметки.' }, { status: 500 });
  return NextResponse.json({ ok: true, notes: data || [] });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'CRM-база пока не подключена.' }, { status: 500 });
  const body = await request.json().catch(() => null);
  const text = String(body?.text || '').trim();
  if (!text) return NextResponse.json({ ok: false, message: 'Введите текст заметки.' }, { status: 400 });
  const { data, error } = await serverSupabase.from('customer_notes').insert({ customer_id: id, text, created_by: 'Администратор' }).select('*').single();
  if (error) return NextResponse.json({ ok: false, message: 'Не удалось добавить заметку.' }, { status: 500 });
  const warning = await logAdminActivity(request, { action: 'customer_note_create', entity: 'customer', entityId: id, after: data });
  return NextResponse.json({ ok: true, note: data, warning: warning ? `Заметка сохранена, но запись в журнал не добавлена: ${warning}` : undefined });
}
