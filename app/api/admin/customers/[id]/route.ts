import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';

const fields = ['full_name', 'phone', 'email', 'city', 'address', 'status', 'tags'] as const;
const normalizePhone = (value: unknown) => String(value || '').replace(/\D/g, '');
const text = (value: unknown) => String(value || '').trim();

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'CRM-база пока не подключена.' }, { status: 500 });
  const [{ data: customer, error }, { data: notes }] = await Promise.all([
    serverSupabase.from('crm_customers').select('*').eq('id', params.id).maybeSingle(),
    serverSupabase.from('customer_notes').select('*').eq('customer_id', params.id).order('created_at', { ascending: false })
  ]);
  if (error || !customer) return NextResponse.json({ ok: false, message: 'Покупатель не найден.' }, { status: 404 });
  return NextResponse.json({ ok: true, customer, notes: notes || [] });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'CRM-база пока не подключена.' }, { status: 500 });
  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};
    for (const field of fields) {
      if (!(field in body)) continue;
      if (field === 'tags') update.tags = Array.isArray(body.tags) ? body.tags.map(text).filter(Boolean).slice(0, 20) : [];
      else if (field === 'status') update.status = ['new', 'active', 'inactive', 'blocked'].includes(body.status) ? body.status : 'new';
      else update[field] = text(body[field]) || null;
    }
    if ('phone' in update) update.normalized_phone = normalizePhone(update.phone);
    if (!Object.keys(update).length) return NextResponse.json({ ok: false, message: 'Нет данных для обновления.' }, { status: 400 });
    update.updated_at = new Date().toISOString();
    const { data, error } = await serverSupabase.from('crm_customers').update(update).eq('id', params.id).select('*').single();
    if (error) throw error;
    if (data.user_id && typeof update.status === 'string' && ['blocked', 'active'].includes(update.status)) await serverSupabase.from('profiles').update({ status: update.status === 'blocked' ? 'blocked' : 'active' }).eq('id', data.user_id);
    await serverSupabase.from('admin_activity_log').insert({ action: update.status === 'blocked' ? 'customer_block' : update.status === 'active' ? 'customer_unblock' : 'customer_update', entity: 'customer', entity_id: params.id, payload: { patch: update } }).then(() => null);
    return NextResponse.json({ ok: true, customer: data });
  } catch {
    return NextResponse.json({ ok: false, message: 'Не удалось сохранить данные покупателя.' }, { status: 500 });
  }
}
