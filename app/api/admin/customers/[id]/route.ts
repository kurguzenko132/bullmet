import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { logAdminActivity } from '@/lib/adminActivity';

const fields = ['full_name', 'phone', 'email', 'city', 'address', 'status', 'tags'] as const;
const normalizePhone = (value: unknown) => String(value || '').replace(/\D/g, '');
const text = (value: unknown) => String(value || '').trim();

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'CRM-база пока не подключена.' }, { status: 500 });
  const [{ data: customer, error }, { data: notes }] = await Promise.all([
    serverSupabase.from('crm_customers').select('*').eq('id', id).maybeSingle(),
    serverSupabase.from('customer_notes').select('*').eq('customer_id', id).order('created_at', { ascending: false })
  ]);
  if (error || !customer) return NextResponse.json({ ok: false, message: 'Покупатель не найден.' }, { status: 404 });
  return NextResponse.json({ ok: true, customer, notes: notes || [] });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'CRM-база пока не подключена.' }, { status: 500 });
  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};
    const { data: before, error: beforeError } = await serverSupabase.from('crm_customers').select('*').eq('id', id).maybeSingle();
    if (beforeError || !before) return NextResponse.json({ ok: false, message: 'Покупатель не найден.' }, { status: 404 });
    for (const field of fields) {
      if (!(field in body)) continue;
      if (field === 'tags') update.tags = Array.isArray(body.tags) ? body.tags.map(text).filter(Boolean).slice(0, 20) : [];
      else if (field === 'status') update.status = ['new', 'active', 'inactive', 'blocked'].includes(body.status) ? body.status : 'new';
      else update[field] = text(body[field]) || null;
    }
    if ('phone' in update) update.normalized_phone = normalizePhone(update.phone);
    if (!Object.keys(update).length) return NextResponse.json({ ok: false, message: 'Нет данных для обновления.' }, { status: 400 });
    update.updated_at = new Date().toISOString();
    const { data, error } = await serverSupabase.from('crm_customers').update(update).eq('id', id).select('*').single();
    if (error) throw error;
    if (data.user_id && typeof update.status === 'string' && ['blocked', 'active'].includes(update.status)) await serverSupabase.from('profiles').update({ status: update.status === 'blocked' ? 'blocked' : 'active' }).eq('id', data.user_id);
    const warning = await logAdminActivity(request, { action: update.status === 'blocked' ? 'customer_block' : update.status === 'active' ? 'customer_unblock' : 'customer_update', entity: 'customer', entityId: id, before, after: data, payload: { changedFields: Object.keys(update) } });
    return NextResponse.json({ ok: true, customer: data, warning: warning ? `Покупатель обновлён, но запись в журнал не добавлена: ${warning}` : undefined });
  } catch {
    return NextResponse.json({ ok: false, message: 'Не удалось сохранить данные покупателя.' }, { status: 500 });
  }
}
