'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'blocked' | 'config-error'>('loading');
  const adminEmails = useMemo(() => getAdminEmails(), []);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      if (!supabase) {
        if (active) setStatus('config-error');
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      const session = data.session;

      if (error || !session) {
        router.replace(`/login?next=${encodeURIComponent(pathname || '/admin')}`);
        return;
      }

      const userEmail = session.user.email?.toLowerCase() || '';
      if (adminEmails.length > 0 && !adminEmails.includes(userEmail)) {
        if (active) setStatus('blocked');
        return;
      }

      if (active) setStatus('allowed');
    }

    checkAccess();

    const { data } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace(`/login?next=${encodeURIComponent(pathname || '/admin')}`);
    }) || { data: null };

    return () => {
      active = false;
      data?.subscription?.unsubscribe();
    };
  }, [adminEmails, pathname, router]);

  if (status === 'allowed') return <>{children}</>;

  if (status === 'blocked') {
    return (
      <div className="admin-access-state">
        <h1>Нет доступа к админке</h1>
        <p>Ваш email не указан в списке администраторов. Добавьте его в NEXT_PUBLIC_ADMIN_EMAIL или NEXT_PUBLIC_ADMIN_EMAILS.</p>
        <button type="button" onClick={async () => { await supabase?.auth.signOut(); router.replace('/login?next=/admin'); }}>
          Войти под другим аккаунтом
        </button>
      </div>
    );
  }

  if (status === 'config-error') {
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
      <p>Сейчас откроем панель управления.</p>
    </div>
  );
}
