'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'register';

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

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const nextUrl = useMemo(() => {
    const value = searchParams.get('next');
    if (!value || !value.startsWith('/')) return '/admin';
    return value;
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase не подключен. Проверь NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Введите email и пароль.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}${nextUrl}` : undefined
          }
        });

        if (signUpError) throw signUpError;

        setMessage('Аккаунт создан. Если в Supabase включено подтверждение email, подтвердите почту и затем войдите.');
        setMode('login');
        setLoading(false);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (signInError) throw signInError;

      const adminEmails = getAdminEmails();
      const userEmail = data.user?.email?.toLowerCase() || cleanEmail;

      if (nextUrl.startsWith('/admin') && adminEmails.length > 0 && !adminEmails.includes(userEmail)) {
        await supabase.auth.signOut();
        setError('Этот email не добавлен в список администраторов. Проверь NEXT_PUBLIC_ADMIN_EMAIL в Vercel.');
        setLoading(false);
        return;
      }

      router.replace(nextUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить вход.');
      setLoading(false);
    }
  }

  return (
    <section className="auth-card auth-card--polished" aria-label="Форма входа и регистрации">
      <div className="auth-mode-cards">
        <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>
          <b>Вход</b><span>Для покупателей и администратора</span>
        </button>
        <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => setMode('register')}>
          <b>Регистрация</b><span>Создать новый аккаунт</span>
        </button>
      </div>

      <div className="auth-form-head">
        <h2>{mode === 'login' ? 'Войти в аккаунт' : 'Создать аккаунт'}</h2>
        <p>{mode === 'login' ? 'Введите email и пароль. Если это админ-email, откроется панель управления.' : 'После регистрации вы сможете быстрее оформлять заявки и сохранять товары.'}</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            placeholder="example@mail.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            placeholder={mode === 'login' ? 'Ваш пароль' : 'Минимум 6 символов'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </label>
        {mode === 'register' && (
          <label>
            Повторите пароль
            <input
              type="password"
              placeholder="Повторите пароль"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>
        )}

        {error && <p className="auth-message auth-message-error">{error}</p>}
        {message && <p className="auth-message auth-message-success">{message}</p>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'ПОДОЖДИТЕ...' : mode === 'login' ? 'ВОЙТИ' : 'СОЗДАТЬ АККАУНТ'}
        </button>

        <div className="auth-links">
          <Link href="/contacts">Нужна помощь со входом?</Link>
          <Link href="/catalog">Вернуться в каталог</Link>
        </div>
      </form>
    </section>
  );
}
