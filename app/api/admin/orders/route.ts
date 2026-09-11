import { NextRequest, NextResponse } from 'next/server';
import { getAdminOrders } from '@/lib/adminCommerce';
import { isSupabaseConfigured, serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await getAdminOrders();
    return NextResponse.json({ ok: true, configured: isSupabaseConfigured(), orders });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: isSupabaseConfigured(), orders: [], message: error instanceof Error ? error.message : 'Не удалось загрузить заказы.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключён.' }, { status: 500 });
  const body = await request.json().catch(() => null);
  const name = String(body?.customer?.name || '').trim();
  const phone = String(body?.customer?.phone || '').trim();
  const items = Array.isArray(body?.items) ? body.items.filter((item: unknown) => item && typeof item === 'object') : [];
  if (!name || !phone) return NextResponse.json({ ok: false, message: 'Укажите имя и телефон покупателя.' }, { status: 400 });
  if (!items.length) return NextResponse.json({ ok: false, message: 'Добавьте хотя бы один товар.' }, { status: 400 });
  const normalized = items.map((item: any) => ({ title: String(item.title || 'Товар'), sku: String(item.sku || ''), image: String(item.image || ''), color: String(item.color || ''), size: String(item.size || ''), material: String(item.material || ''), price: Math.max(0, Number(item.price || 0)), quantity: Math.max(1, Number(item.quantity || 1)) }));
  const total = normalized.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const id = `#${Date.now().toString().slice(-8)}`;
  const now = new Date().toISOString();
  const order = { id, customer: { name, phone, email: String(body?.customer?.email || '').trim() }, delivery: String(body?.delivery || 'Самовывоз'), delivery_address: String(body?.delivery_address || '').trim(), payment_method: String(body?.payment_method || 'При получении'), source: String(body?.source || 'admin'), comment: String(body?.comment || '').trim(), admin_note: '', items: normalized, total, status: 'Новый', priority: 'normal', status_history: [{ status: 'Новый', created_at: now, author: 'Администратор', note: 'Заказ создан вручную' }] };
  const { data, error } = await serverSupabase.from('orders').insert(order).select('*').single();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  await serverSupabase.from('admin_activity_log').insert({ action: 'order_create', entity: 'orders', entity_id: id, payload: { source: 'admin', total } }).then(() => null);
  return NextResponse.json({ ok: true, order: data });
}
