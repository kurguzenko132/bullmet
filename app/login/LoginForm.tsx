'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'register';

export function LoginForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!supabase) {
      setError('Supabase не подключен. Проверь NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в Vercel Environment Variables.');
      return;
    }

    if (!email || !password) {
      setError('Введите email и пароль.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('Вход выполнен. Перенаправляю...');
        window.location.href = '/catalog';
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        setMessage('Регистрация отправлена. Если в Supabase включено подтверждение email, проверьте почту.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить запрос к Supabase.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card" aria-label="Форма входа и регистрации">
      <div className="auth-tabs">
        <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>Вход</button>
        <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => setMode('register')}>Регистрация</button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <label>
            Имя
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} type="text" placeholder="Введите имя" />
          </label>
        )}
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Введите email" autoComplete="email" />
        </label>
        <label>
          Пароль
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Введите пароль" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </label>
        <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'ПОДОЖДИТЕ...' : mode === 'login' ? 'ВОЙТИ В АККАУНТ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}</button>
        <div className="auth-links">
          <Link href="/contacts">Забыли пароль?</Link>
          <Link href="/catalog">Вернуться в каталог</Link>
        </div>
        {message && <p className="auth-note" style={{ color: '#17803d' }}>{message}</p>}
        {error && <p className="auth-note" style={{ color: '#c62828' }}>{error}</p>}
      </form>

      <p className="auth-note">
        Вход и регистрация подключены к Supabase Auth. На Vercel обязательно добавьте Supabase-переменные окружения и сделайте redeploy.
      </p>
    </section>
  );
}
