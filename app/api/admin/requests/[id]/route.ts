import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabase';
import { requestStatuses } from '@/lib/adminCommerce';
import { logAdminActivity } from '@/lib/adminActivity';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!serverSupabase) {
      return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });
    }

    const body = await request.json();
    const update: Record<string, string | null> = {};
    const { data: before, error: beforeError } = await serverSupabase.from('requests').select('*').eq('id', id).maybeSingle();
    if (beforeError) return NextResponse.json({ ok: false, message: beforeError.message }, { status: 500 });
    if (!before) return NextResponse.json({ ok: false, message: 'Заявка не найдена.' }, { status: 404 });

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

    const { data, error } = await serverSupabase.from('requests').update(update).eq('id', id).select('*').single();

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    const warning = await logAdminActivity(request, { action: 'requests_update', entity: 'requests', entityId: id, before, after: data, payload: { changedFields: Object.keys(update) } });

    return NextResponse.json({ ok: true, warning: warning ? `Заявка обновлена, но запись в журнал не добавлена: ${warning}` : undefined });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось обновить заявку.' }, { status: 500 });
  }
}
