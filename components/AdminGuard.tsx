'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { canAccessAdminPath, defaultAdminPath, isStaffRole, normalizeAdminRole, roleLabel } from '@/lib/adminAccess';
import { AdminAccessProvider, type AdminAccessProfile } from './AdminAccessContext';

function getAdminEmails() {
  return [
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    process.env.NEXT_PUBLIC_ADMIN_EMAILS
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

type GuardState =
  | { status: 'loading' }
  | { status: 'allowed'; profile: AdminAccessProfile }
  | { status: 'blocked'; reason: string; profile?: AdminAccessProfile }
  | { status: 'route-blocked'; profile: AdminAccessProfile }
  | { status: 'config-error' };

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<GuardState>({ status: 'loading' });
  const adminEmails = useMemo(() => getAdminEmails(), []);

  useEffect(() => {
    let active = true;

    async function loadProfile(userId: string, email: string) {
      const fallbackRole = adminEmails.includes(email) ? 'admin' : 'customer';

      try {
        const { data } = await supabase!
          .from('profiles')
          .select('id, email, full_name, role, status')
          .eq('id', userId)
          .maybeSingle();

        const profileRole = normalizeAdminRole(data?.role || fallbackRole);
        const resolvedRole = adminEmails.includes(email) && profileRole === 'customer' ? 'admin' : profileRole;

        return {
          id: userId,
          email,
          role: resolvedRole,
          status: data?.status || 'active',
          fullName: data?.full_name || ''
        } satisfies AdminAccessProfile;
      } catch {
        return {
          id: userId,
          email,
          role: normalizeAdminRole(fallbackRole),
          status: 'active',
          fullName: ''
        } satisfies AdminAccessProfile;
      }
    }

    async function checkAccess() {
      if (!supabase) {
        if (active) setState({ status: 'config-error' });
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      const session = data.session;

      if (error || !session) {
        router.replace(`/login?next=${encodeURIComponent(pathname || '/admin')}`);
        return;
      }

      const email = session.user.email?.toLowerCase() || '';
      const profile = await loadProfile(session.user.id, email);

      if (profile.status === 'blocked') {
        if (active) setState({ status: 'blocked', reason: 'Пользователь заблокирован в админке.', profile });
        return;
      }

      if (!isStaffRole(profile.role)) {
        if (active) setState({ status: 'blocked', reason: 'У пользователя нет рабочей роли для входа в админку.', profile });
        return;
      }

      if (!canAccessAdminPath(profile.role, pathname)) {
        if (active) setState({ status: 'route-blocked', profile });
        return;
      }

      if (active) setState({ status: 'allowed', profile });
    }

    void checkAccess();

    const { data } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace(`/login?next=${encodeURIComponent(pathname || '/admin')}`);
    }) || { data: null };

    return () => {
      active = false;
      data?.subscription?.unsubscribe();
    };
  }, [adminEmails, pathname, router]);

  if (state.status === 'allowed') {
    return <AdminAccessProvider profile={state.profile}>{children}</AdminAccessProvider>;
  }

  if (state.status === 'route-blocked') {
    return (
      <AdminAccessProvider profile={state.profile}>
        <div className="admin-access-state admin-access-state--blocked-route">
          <h1>Раздел недоступен</h1>
          <p>Ваша роль: <b>{roleLabel(state.profile.role)}</b>. Для этого раздела нужны другие права доступа.</p>
          <div className="admin-access-actions">
            <button type="button" onClick={() => router.replace(defaultAdminPath(state.profile.role))}>Перейти в доступный раздел</button>
            <button type="button" onClick={async () => { await supabase?.auth.signOut(); router.replace('/login?next=/admin'); }}>Войти под другим аккаунтом</button>
          </div>
        </div>
      </AdminAccessProvider>
    );
  }

  if (state.status === 'blocked') {
    return (
      <div className="admin-access-state">
        <h1>Нет доступа к админке</h1>
        <p>{state.reason}</p>
        <p>Попросите администратора назначить роль <b>manager</b>, <b>content_manager</b> или <b>admin</b> в разделе пользователей.</p>
        <button type="button" onClick={async () => { await supabase?.auth.signOut(); router.replace('/login?next=/admin'); }}>
          Войти под другим аккаунтом
        </button>
      </div>
    );
  }

  if (state.status === 'config-error') {
    return (
      <div className="admin-access-state">
        <h1>Supabase не подключен</h1>
        <p>Добавьте переменные NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local и в Vercel.</p>
      </div>
    );
  }

  return (
    <div className="admin-access-state">
      <h1>Проверяем доступ...</h1>
      <p>Сейчас откроем доступный раздел панели управления.</p>
    </div>
  );
}
