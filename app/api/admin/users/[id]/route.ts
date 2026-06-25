import { NextRequest, NextResponse } from 'next/server';
import { adminRoles } from '@/lib/adminPeople';
import { serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

const roleValues = adminRoles.map((role) => role.value);

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { error } = await serverSupabase.from('profiles').update(update).eq('id', params.id);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    await serverSupabase.from('admin_activity_log').insert({
      action: 'user_update',
      entity: 'profiles',
      entity_id: params.id,
      payload: { patch: update }
    }).then(() => null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось обновить пользователя.' }, { status: 500 });
  }
}
