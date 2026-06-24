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


function getReadableAuthError(error: unknown, mode: Mode, adminLogin: boolean) {
  const raw = error instanceof Error ? error.message : String(error || '');
  const lower = raw.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return adminLogin
      ? 'Неверный email или пароль. Для входа в админку пользователь должен быть создан в Supabase Auth и его email должен совпадать с NEXT_PUBLIC_ADMIN_EMAIL / NEXT_PUBLIC_ADMIN_EMAILS.'
      : 'Неверный email или пароль. Если аккаунта ещё нет, сначала нажмите «Регистрация» и создайте личный кабинет.';
  }

  if (lower.includes('email not confirmed') || lower.includes('confirm')) {
    return 'Email ещё не подтверждён. Откройте письмо от Supabase и подтвердите почту, затем войдите снова.';
  }

  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'Аккаунт с таким email уже существует. Переключитесь на «Вход» и введите пароль.';
  }

  if (lower.includes('password should be') || lower.includes('password')) {
    return mode === 'register'
      ? 'Пароль слишком короткий или не подходит. Используйте минимум 6 символов.'
      : 'Проверьте пароль и попробуйте ещё раз.';
  }

  return raw || (mode === 'login' ? 'Не удалось выполнить вход.' : 'Не удалось создать аккаунт.');
}

function isInvalidCredentialsError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || '');
  return raw.toLowerCase().includes('invalid login credentials');
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
  const [showCreateHint, setShowCreateHint] = useState(false);

  const nextUrl = useMemo(() => {
    const rawValue = searchParams.get('next') || '/account';
    let value = rawValue.trim();

    try {
      value = decodeURIComponent(value);
    } catch {}

    if (!value.startsWith('/') || value.startsWith('//')) return '/account';

    const cleanValue = value.split('#')[0].split('?')[0].replace(/\/$/, '') || '/account';

    if (cleanValue === '/profile' || cleanValue === '/cabinet' || cleanValue === '/lk') return '/account';
    if (cleanValue.startsWith('/account')) return '/account';
    if (cleanValue.startsWith('/admin')) return cleanValue;
    if (cleanValue.startsWith('/cart')) return '/cart';
    if (cleanValue.startsWith('/order-success')) return value;

    return '/account';
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setShowCreateHint(false);

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

        setMessage('Аккаунт создан. Если включено подтверждение email, подтвердите почту и затем войдите. Если подтверждение отключено — можно сразу попробовать войти.');
        setMode('login');
        setLoading(false);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (signInError) throw signInError;

      try {
        window.localStorage.setItem('bullmet_account_last_email', cleanEmail);
        window.localStorage.setItem('bullmet_account_last_login_at', String(Date.now()));
        window.dispatchEvent(new Event('bullmet-auth-updated'));
      } catch {}

      const adminEmails = getAdminEmails();
      const userEmail = data.user?.email?.toLowerCase() || cleanEmail;

      if (nextUrl.startsWith('/admin') && adminEmails.length > 0 && !adminEmails.includes(userEmail)) {
        await supabase.auth.signOut();
        setError('Этот email не добавлен в список администраторов. Проверь NEXT_PUBLIC_ADMIN_EMAIL в Vercel.');
        setLoading(false);
        return;
      }

      const targetUrl = nextUrl || '/account';
      router.replace(targetUrl);
      router.refresh();

      // Жесткий переход нужен, чтобы Supabase-сессия точно успела сохраниться
      // и личный кабинет открылся без повторного ввода пароля.
      window.setTimeout(() => {
        window.location.href = targetUrl;
      }, 100);
    } catch (err) {
      const adminLogin = nextUrl.startsWith('/admin');
      setError(getReadableAuthError(err, mode, adminLogin));
      setShowCreateHint(mode === 'login' && !adminLogin && isInvalidCredentialsError(err));
      setLoading(false);
    }
  }

  return (
    <section className="auth-card auth-card--polished" aria-label="Форма входа и регистрации">
      <div className="auth-mode-cards">
        <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => { setMode('login'); setError(''); setMessage(''); setShowCreateHint(false); }}>
          <b>Вход</b><span>Войти по email и паролю</span>
        </button>
        <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => { setMode('register'); setError(''); setMessage(''); setShowCreateHint(false); }}>
          <b>Регистрация</b><span>Создать личный аккаунт</span>
        </button>
      </div>

      <div className="auth-form-head">
        <h2>{mode === 'login' ? 'С возвращением' : 'Создать аккаунт'}</h2>
        <p>{mode === 'login' ? 'Введите email и пароль, чтобы продолжить оформление заказа или посмотреть сохраненные товары.' : 'Аккаунт пригодится для заказов, избранного и быстрого оформления.'}</p>
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
        {showCreateHint && (
          <button
            className="auth-inline-action"
            type="button"
            onClick={() => { setMode('register'); setError(''); setMessage(''); setShowCreateHint(false); }}
          >
            Создать аккаунт с этим email
          </button>
        )}
        {message && <p className="auth-message auth-message-success">{message}</p>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'ПОДОЖДИТЕ...' : mode === 'login' ? 'ВОЙТИ' : 'СОЗДАТЬ АККАУНТ'}
        </button>

        <div className="auth-links">
          <Link href="/contacts">Нужна помощь?</Link>
          <Link href="/catalog">Вернуться в каталог</Link>
        </div>
      </form>
    </section>
  );
}
