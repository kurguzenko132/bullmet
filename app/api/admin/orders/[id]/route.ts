import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { orderStatuses } from '@/lib/adminCommerce';
import { logAdminActivity } from '@/lib/adminActivity';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });
  const { data: order, error } = await serverSupabase.from('orders').select('id, created_at, customer, delivery, delivery_address, payment_method, source, comment, admin_note, priority, follow_up_at, manager, items, total, status, status_history').eq('id', id).maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  if (!order) return NextResponse.json({ ok: false, message: 'Заказ не найден.' }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!serverSupabase) {
      return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });
    }

    const body = await request.json();
    const update: Record<string, unknown> = {};
    const { data: before, error: beforeError } = await serverSupabase.from('orders').select('*').eq('id', id).maybeSingle();
    if (beforeError) return NextResponse.json({ ok: false, message: beforeError.message }, { status: 500 });
    if (!before) return NextResponse.json({ ok: false, message: 'Заказ не найден.' }, { status: 404 });

    if (typeof body.status === 'string' && orderStatuses.includes(body.status)) {
      update.status = body.status;
      const history = Array.isArray(before.status_history) ? before.status_history : [];
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
    const { data, error } = await serverSupabase.from('orders').update(update).eq('id', id).select('*').single();

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    await serverSupabase
    const activityWarning = await logAdminActivity(request, {
      action: body.status ? 'order_status_update' : 'orders_update',
      entity: 'orders', entityId: id, before, after: data,
      payload: { changedFields: Object.keys(update).filter((key) => key !== 'updated_at') }
    });

    return NextResponse.json({ ok: true, order: data, warning: activityWarning ? `Заказ обновлён, но запись в журнал не добавлена: ${activityWarning}` : undefined });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось обновить заказ.' }, { status: 500 });
  }
}
