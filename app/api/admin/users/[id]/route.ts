import { NextRequest, NextResponse } from 'next/server';
import { adminRoles } from '@/lib/adminPeople';
import { serverSupabase } from '@/lib/serverSupabase';
import { logAdminActivity } from '@/lib/adminActivity';

export const dynamic = 'force-dynamic';

const roleValues = adminRoles.map((role) => role.value);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });

    const body = await request.json();
    const update: Record<string, string | null> = {};

    if (typeof body.role === 'string' && roleValues.includes(body.role as any)) {
      update.role = body.role;
    }

    if (typeof body.full_name === 'string') {
      update.full_name = body.full_name.trim();
    }

    if (typeof body.phone === 'string') {
      update.phone = body.phone.trim();
    }

    if (typeof body.status === 'string' && ['active', 'blocked'].includes(body.status)) {
      update.status = body.status;
    }

    if (!Object.keys(update).length) {
      return NextResponse.json({ ok: false, message: 'Нет данных для обновления.' }, { status: 400 });
    }

    const { data: current, error: currentError } = await serverSupabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (currentError) return NextResponse.json({ ok: false, message: currentError.message }, { status: 500 });
    const removesLastAdmin = current?.role === 'admin' && current.status !== 'blocked' && (update.role !== undefined && update.role !== 'admin' || update.status === 'blocked');
    if (removesLastAdmin) {
      const { count, error: countError } = await serverSupabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin').neq('status', 'blocked');
      if (countError) return NextResponse.json({ ok: false, message: countError.message }, { status: 500 });
      if ((count || 0) <= 1) return NextResponse.json({ ok: false, message: 'Нельзя отключить последнего администратора системы.' }, { status: 400 });
    }

    const { data: updated, error } = await serverSupabase.from('profiles').update(update).eq('id', id).select('*').single();
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    const activityWarning = await logAdminActivity(request, {
      action: 'user_update', entity: 'profiles', entityId: id, before: current, after: updated,
      payload: { changedFields: Object.keys(update) }
    });

    return NextResponse.json({ ok: true, warning: activityWarning ? `Пользователь обновлён, но запись в журнал не добавлена: ${activityWarning}` : undefined });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось обновить пользователя.' }, { status: 500 });
  }
}
