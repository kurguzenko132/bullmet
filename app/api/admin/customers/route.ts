import { NextRequest, NextResponse } from 'next/server';
import { getAdminCustomerRecords } from '@/lib/adminPeople';
import { serverSupabase } from '@/lib/serverSupabase';

const normalizePhone = (value: unknown) => String(value || '').replace(/\D/g, '');
const text = (value: unknown) => String(value || '').trim();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ ok: true, customers: await getAdminCustomerRecords() });
  } catch {
    return NextResponse.json({ ok: false, message: 'Не удалось загрузить покупателей.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'CRM-база пока не подключена.' }, { status: 500 });
  try {
    const body = await request.json();
    const full_name = text(body.full_name);
    const phone = text(body.phone);
    const email = text(body.email).toLowerCase();
    const normalized_phone = normalizePhone(phone);
    if (!full_name || !phone) return NextResponse.json({ ok: false, message: 'Укажите имя и телефон покупателя.' }, { status: 400 });

    let existing = null;
    if (email) ({ data: existing } = await serverSupabase.from('crm_customers').select('*').ilike('email', email).maybeSingle());
    if (!existing && normalized_phone) ({ data: existing } = await serverSupabase.from('crm_customers').select('*').eq('normalized_phone', normalized_phone).maybeSingle());
    if (existing) return NextResponse.json({ ok: false, message: 'Покупатель с такими контактами уже есть в CRM.', customer: existing }, { status: 409 });

    const { data, error } = await serverSupabase.from('crm_customers').insert({ full_name, phone, normalized_phone, email: email || null, city: text(body.city) || null, address: text(body.address) || null, status: 'new', source: text(body.source) || 'admin', tags: [] }).select('*').single();
    if (error) throw error;
    const note = text(body.comment);
    if (note) await serverSupabase.from('customer_notes').insert({ customer_id: data.id, text: note, created_by: 'Администратор' });
    await serverSupabase.from('admin_activity_log').insert({ action: 'customer_create', entity: 'customer', entity_id: data.id, payload: { source: data.source } }).then(() => null);
    return NextResponse.json({ ok: true, customer: data });
  } catch {
    return NextResponse.json({ ok: false, message: 'Не удалось создать покупателя.' }, { status: 500 });
  }
}
