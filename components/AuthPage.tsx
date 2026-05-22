'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer, Header } from './HomePage';
import { getCurrentSession, signInBullmet, signOutBullmet, type BullmetSession } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

export function AuthPage() {
  const router = useRouter();
  const [session, setSession] = useState<BullmetSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getCurrentSession().then((nextSession) => {
      if (!mounted) return;
      if (nextSession?.role === 'admin') {
        router.replace('/admin');
        return;
      }
      setSession(nextSession);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');

    try {
      const nextSession = await signInBullmet(email, password);
      setSession(nextSession);
      if (nextSession.role === 'admin') router.replace('/admin');
      else router.replace('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти.');
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    await signOutBullmet();
    setSession(null);
  }

  return (
    <>
      <Header />
      <main className="accountPage">
        <section className="container catalogHero">
          <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Вход</span></div>
          <h1 className="pageTitle">Вход в аккаунт</h1>
        </section>

        <section className="container accountShell authShell">
          <div className="accountIntro">
            <div>
              <h2>Аккаунт Bullmet</h2>
              <p>Войдите как клиент, чтобы видеть заказы и заявки, или как администратор, чтобы открыть панель управления сайтом.</p>
            </div>
            <div className="accountIntro__list">
              <span><i /> Клиент попадает в личный кабинет</span>
              <span><i /> Администратор попадает в админку</span>
              <span><i /> Роли хранятся в Supabase Profiles</span>
            </div>
          </div>

          <div className="loginPanel">
            {loading ? (
              <div className="accountLogged"><h2>Проверяем вход...</h2><p>Подождите пару секунд.</p></div>
            ) : session ? (
              <div className="accountLogged">
                <h2>Вы уже вошли</h2>
                <p><b>Email:</b> {session.email}</p>
                <p><b>Роль:</b> {session.role === 'admin' ? 'Администратор' : 'Покупатель'}</p>
                <p><b>Источник:</b> {session.source === 'supabase' ? 'Supabase Auth' : 'Демо-режим'}</p>
                <div className="accountLogged__actions">
                  {session.role === 'admin' ? <Link className="button button--orange" href="/admin">Открыть админку</Link> : <Link className="button button--orange" href="/account">Открыть кабинет</Link>}
                  <Link className="button button--outline" href="/catalog">В каталог</Link>
                  <button className="button button--outline" type="button" onClick={logout}>Выйти</button>
                </div>
              </div>
            ) : (
              <>
                <h2>Вход</h2>
                <form className="loginForm" onSubmit={submit}>
                  <label>Email<input name="email" type="email" placeholder="admin@bullmet.by" required /></label>
                  <label>Пароль<input name="password" type="password" placeholder="admin123" required /></label>
                  {error && <p className="formError">{error}</p>}
                  <button className="button button--orange" type="submit" disabled={submitting}>{submitting ? 'Входим...' : 'Войти'}</button>
                  <Link className="button button--outline" href="/register">Зарегистрироваться</Link>
                </form>
                <p className="loginHint">
                  {isSupabaseConfigured
                    ? 'Для доступа в админку пользователь должен иметь role = admin в таблице profiles.'
                    : 'Демо-вход администратора: admin@bullmet.by / admin123. После подключения Supabase роли будут храниться в базе.'}
                </p>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
