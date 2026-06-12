'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Icon } from './Icon';

type AccountStatus = 'loading' | 'ready' | 'config-error';

type AccountUser = {
  email: string;
  createdAt?: string;
};

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

export function AccountClient() {
  const router = useRouter();
  const [status, setStatus] = useState<AccountStatus>('loading');
  const [user, setUser] = useState<AccountUser | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      if (!supabase) {
        if (active) setStatus('config-error');
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      const session = data.session;

      if (error || !session) {
        router.replace('/login?next=/account');
        return;
      }

      if (!active) return;
      setUser({
        email: session.user.email || '',
        createdAt: session.user.created_at
      });
      setStatus('ready');
    }

    loadSession();

    const { data } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login?next=/account');
    }) || { data: null };

    return () => {
      active = false;
      data?.subscription?.unsubscribe();
    };
  }, [router]);

  async function signOut() {
    setSigningOut(true);
    await supabase?.auth.signOut();
    window.location.href = '/login?next=/account';
  }

  if (status === 'loading') {
    return (
      <section className="account-state-card">
        <h1>Открываем личный кабинет...</h1>
        <p>Проверяем вход в аккаунт.</p>
      </section>
    );
  }

  if (status === 'config-error') {
    return (
      <section className="account-state-card">
        <h1>Supabase не подключен</h1>
        <p>Добавьте переменные NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в Vercel и .env.local.</p>
      </section>
    );
  }

  const adminEmails = getAdminEmails();
  const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());

  return (
    <section className="account-page-shell">
      <div className="account-hero-card">
        <div>
          <p className="section-kicker">Личный кабинет</p>
          <h1>Добро пожаловать</h1>
          <span>{user?.email}</span>
        </div>
        <button type="button" onClick={signOut} disabled={signingOut}>{signingOut ? 'Выходим...' : 'Выйти'}</button>
      </div>

      <div className="account-grid">
        <article>
          <Icon name="cart" />
          <h2>Корзина</h2>
          <p>Перейдите к выбранным товарам и оформите заказ.</p>
          <Link href="/cart">Открыть корзину</Link>
        </article>
        <article>
          <Icon name="request" />
          <h2>Заявка на расчет</h2>
          <p>Отправьте чертеж, фото или описание изделия.</p>
          <Link href="/services#request">Заказать расчет</Link>
        </article>
        <article>
          <Icon name="search" />
          <h2>Каталог</h2>
          <p>Вернитесь к товарам Bullmet и подберите изделие.</p>
          <Link href="/catalog">Смотреть товары</Link>
        </article>
        {isAdmin && (
          <article className="account-admin-card">
            <Icon name="shield" />
            <h2>Админка</h2>
            <p>Ваш email добавлен в список администраторов.</p>
            <Link href="/admin">Открыть админку</Link>
          </article>
        )}
      </div>

      <div className="account-note-card">
        <b>Что будет дальше?</b>
        <p>Следующим этапом сюда можно добавить историю заказов, избранное, статусы заявок и повтор заказа.</p>
      </div>
    </section>
  );
}
