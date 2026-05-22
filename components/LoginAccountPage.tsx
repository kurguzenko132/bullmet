'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, Footer } from './HomePage';

const ADMIN_EMAIL = 'admin@bullmet.by';
const ADMIN_PASSWORD = 'admin123';

export function LoginAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: 'admin' | 'client' } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('bullmet-user');
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      window.localStorage.setItem('bullmet-user', JSON.stringify({ email, role: 'admin' }));
      router.push('/admin');
      return;
    }

    if (email && password.length >= 3) {
      const nextUser = { email, role: 'client' as const };
      window.localStorage.setItem('bullmet-user', JSON.stringify(nextUser));
      setUser(nextUser);
      setError('');
      return;
    }

    setError('Введите email и пароль. Для админки: admin@bullmet.by / admin123');
  }

  function logout() {
    window.localStorage.removeItem('bullmet-user');
    setUser(null);
  }

  return (
    <>
      <Header />
      <main className="accountPage">
        <section className="container catalogHero">
          <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Аккаунт</span></div>
          <h1 className="pageTitle">Личный кабинет</h1>
        </section>
        <section className="container accountShell">
          <div className="accountIntro">
            <div>
              <h2>Аккаунт покупателя Bullmet</h2>
              <p>Вход разделяет обычного клиента и администратора. Если ввести админские данные, система откроет панель управления.</p>
            </div>
            <div className="accountIntro__list">
              <span><i /> Мои заказы и заявки</span>
              <span><i /> Избранные товары</span>
              <span><i /> Данные для доставки</span>
            </div>
          </div>

          <div className="loginPanel">
            {user ? (
              <div className="accountLogged">
                <h2>Вы вошли</h2>
                <p><b>Email:</b> {user.email}</p>
                <p><b>Роль:</b> {user.role === 'admin' ? 'Администратор' : 'Покупатель'}</p>
                <div className="accountLogged__actions">
                  {user.role === 'admin' && <Link className="button button--orange" href="/admin">Открыть админку</Link>}
                  <Link className="button button--outline" href="/catalog">В каталог</Link>
                  <button className="button button--outline" type="button" onClick={logout}>Выйти</button>
                </div>
              </div>
            ) : (
              <>
                <h2>Вход</h2>
                <form className="loginForm" onSubmit={submit}>
                  <label>Email<input name="email" type="email" placeholder="admin@bullmet.by" /></label>
                  <label>Пароль<input name="password" type="password" placeholder="admin123" /></label>
                  {error && <p className="formError">{error}</p>}
                  <button className="button button--orange" type="submit">Войти</button>
                  <button className="button button--outline" type="button" onClick={() => alert('Регистрацию подключим через Supabase Auth.')}>Зарегистрироваться</button>
                </form>
                <p className="loginHint">Данные для входа в админку: <b>admin@bullmet.by</b> / <b>admin123</b>. Позже заменим на Supabase Auth.</p>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
