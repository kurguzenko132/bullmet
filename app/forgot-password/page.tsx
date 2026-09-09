'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Введите корректный email');
      return;
    }

    if (!supabase) {
      setError('Сервис авторизации временно недоступен. Попробуйте ещё раз немного позже.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`
      });

      if (resetError) throw resetError;
      setMessage('Проверьте почту. Если аккаунт с таким email существует, мы отправили ссылку для восстановления пароля.');
    } catch {
      setError('Не удалось отправить ссылку. Попробуйте ещё раз немного позже.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="auth-page auth-forgot-page">
        <div className="auth-forgot-container">
          <section className="auth-card auth-forgot-card" aria-label="Восстановление пароля">
            <div className="auth-form-head">
              <p className="auth-eyebrow">Аккаунт Bullmet</p>
              <h1>Восстановление пароля</h1>
              <p>Введите email, и мы отправим ссылку для восстановления.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>Email</span>
                <div className="auth-input-wrap">
                  <Mail aria-hidden="true" />
                  <input type="email" placeholder="example@email.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </div>
              </label>

              {error && <p className="auth-message auth-message-error">{error}</p>}
              {message && <p className="auth-message auth-message-success">{message}</p>}

              <button type="submit" className="auth-submit" disabled={loading}>
                <span>{loading ? 'Отправляем...' : 'Отправить ссылку'}</span>
                <ArrowRight aria-hidden="true" />
              </button>

              <div className="auth-links">
                <Link href="/login">Вернуться ко входу</Link>
                <Link href="/catalog">Вернуться в каталог</Link>
              </div>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
