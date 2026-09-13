import { NextRequest, NextResponse } from 'next/server';
import { adminRoles, getAdminProfiles, type AdminProfile } from '@/lib/adminPeople';
import { isSupabaseConfigured, serverSupabase } from '@/lib/serverSupabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getAdminProfiles();
    return NextResponse.json({ ok: true, configured: isSupabaseConfigured(), users });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: isSupabaseConfigured(), users: [], message: error instanceof Error ? error.message : 'Не удалось загрузить пользователей.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!serverSupabase) return NextResponse.json({ ok: false, message: 'Supabase не подключен.' }, { status: 500 });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, message: 'Для приглашения сотрудника добавьте SUPABASE_SERVICE_ROLE_KEY в настройки проекта.' }, { status: 503 });
    }

    const body = await request.json();
    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const role = typeof body.role === 'string' ? body.role : '';
    const allowedRoles = adminRoles.map((item) => item.value).filter((item) => item !== 'customer');

    if (!fullName || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ ok: false, message: 'Укажите имя и корректный email сотрудника.' }, { status: 400 });
    }
    if (!allowedRoles.includes(role as typeof allowedRoles[number])) {
      return NextResponse.json({ ok: false, message: 'Выберите роль сотрудника.' }, { status: 400 });
    }

    const { data: invitation, error: invitationError } = await serverSupabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, phone, role }
    });
    if (invitationError || !invitation.user) {
      return NextResponse.json({ ok: false, message: invitationError?.message || 'Не удалось отправить приглашение.' }, { status: 400 });
    }

    const user: AdminProfile = {
      id: invitation.user.id,
      email,
      full_name: fullName,
      phone,
      role,
      status: 'active',
      created_at: invitation.user.created_at,
      updated_at: invitation.user.updated_at
    };
    const { error: profileError } = await serverSupabase.from('profiles').upsert(user, { onConflict: 'id' });
    if (profileError) return NextResponse.json({ ok: false, message: profileError.message }, { status: 500 });

    await serverSupabase.from('admin_activity_log').insert({
      action: 'user_invited',
      entity: 'profiles',
      entity_id: user.id,
      payload: { email, role }
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Не удалось создать приглашение.' }, { status: 500 });
  }
}
