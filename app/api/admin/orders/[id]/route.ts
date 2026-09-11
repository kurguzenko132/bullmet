import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { getAdminOrders, orderStatuses } from '@/lib/adminCommerce';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const order = (await getAdminOrders()).find((item) => item.id === params.id);
  if (!order) return NextResponse.json({ ok: false, message: 'Заказ не найден.' }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!serverSupabase) {
      return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });
    }

    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (typeof body.status === 'string' && orderStatuses.includes(body.status)) {
      update.status = body.status;
      const { data: current } = await serverSupabase.from('orders').select('status_history').eq('id', params.id).maybeSingle();
      const history = Array.isArray(current?.status_history) ? current.status_history : [];
      update.status_history = [...history, { status: body.status, created_at: new Date().toISOString(), author: 'Администратор' }];
    }

    if (typeof body.admin_note === 'string') {
      update.admin_note = body.admin_note.trim();
    }

    if (typeof body.priority === 'string' && ['normal', 'high', 'urgent'].includes(body.priority)) {
      update.priority = body.priority;
    }

    if (typeof body.manager === 'string') {
      update.manager = body.manager.trim();
    }

    if (typeof body.follow_up_at === 'string') {
      update.follow_up_at = body.follow_up_at.trim() || null;
    }

    if (!Object.keys(update).length) {
      return NextResponse.json({ ok: false, message: 'Нет данных для обновления.' }, { status: 400 });
    }

    update.updated_at = new Date().toISOString();
    const { data, error } = await serverSupabase.from('orders').update(update).eq('id', params.id).select('*').single();

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    await serverSupabase
      .from('admin_activity_log')
      .insert({
        action: body.status ? 'order_status_update' : 'orders_update',
        entity: 'orders',
        entity_id: params.id,
        payload: { patch: update }
      })
      .then(() => null);

    return NextResponse.json({ ok: true, order: data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось обновить заказ.' }, { status: 500 });
  }
}
