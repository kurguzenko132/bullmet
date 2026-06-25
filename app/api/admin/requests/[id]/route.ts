import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { requestStatuses } from '@/lib/adminCommerce';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!serverSupabase) {
      return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });
    }

    const body = await request.json();
    const update: Record<string, string | null> = {};

    if (typeof body.status === 'string' && requestStatuses.includes(body.status)) {
      update.status = body.status;
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

    const { error } = await serverSupabase.from('requests').update(update).eq('id', params.id);

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    await serverSupabase
      .from('admin_activity_log')
      .insert({
        action: 'requests_update',
        entity: 'requests',
        entity_id: params.id,
        payload: { patch: update }
      })
      .then(() => null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось обновить заявку.' }, { status: 500 });
  }
}
