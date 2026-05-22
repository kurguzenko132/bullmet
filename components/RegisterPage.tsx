'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer, Header } from './HomePage';
import { signUpBullmet } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

export function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get('fullName') || '').trim();
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');

    if (password.length < 6) {
      setError('Пароль должен быть минимум 6 символов.');
      setSubmitting(false);
      return;
    }

    try {
      const session = await signUpBullmet(email, password, fullName);
      if (isSupabaseConfigured && !session) {
        setMessage('Регистрация создана. Проверьте почту и подтвердите email, если это включено в Supabase.');
      } else {
        router.push('/account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось зарегистрироваться.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="accountPage">
        <section className="container catalogHero">
          <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Регистрация</span></div>
          <h1 className="pageTitle">Регистрация</h1>
        </section>

        <section className="container accountShell authShell">
          <div className="accountIntro">
            <div>
              <h2>Создайте аккаунт покупателя</h2>
              <p>После регистрации клиент сможет хранить свои данные, видеть историю заказов и заявки на индивидуальный расчет.</p>
            </div>
            <div className="accountIntro__list">
              <span><i /> История заказов</span>
              <span><i /> Заявки на расчет</span>
              <span><i /> Быстрое оформление</span>
            </div>
          </div>

          <div className="loginPanel">
            <h2>Новый аккаунт</h2>
            <form className="loginForm" onSubmit={submit}>
              <label>Имя<input name="fullName" type="text" placeholder="Ваше имя" required /></label>
              <label>Email<input name="email" type="email" placeholder="you@example.com" required /></label>
              <label>Пароль<input name="password" type="password" placeholder="Минимум 6 символов" required /></label>
              {error && <p className="formError">{error}</p>}
              {message && <p className="formSuccess">{message}</p>}
              <button className="button button--orange" type="submit" disabled={submitting}>{submitting ? 'Создаем...' : 'Зарегистрироваться'}</button>
              <Link className="button button--outline" href="/login">Уже есть аккаунт</Link>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
