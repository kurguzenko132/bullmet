import Link from 'next/link';
import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { AuthForm } from '@/components/AuthForm';

export const metadata = {
  title: 'Вход в аккаунт | Bullmet',
  description: 'Войти или зарегистрироваться в личном кабинете Bullmet.'
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-info">
            <p className="auth-eyebrow">Личный кабинет Bullmet</p>
            <h1>Войти в аккаунт</h1>
            <p>
              Сохраняйте товары, быстрее отправляйте заявки на расчет и возвращайтесь к выбранным изделиям без повторного поиска.
            </p>
            <div className="auth-benefits">
              <div><Icon name="cart" /><span>Быстрое оформление</span></div>
              <div><Icon name="request" /><span>Заявки на расчет</span></div>
              <div><Icon name="shield" /><span>Сохраненные данные</span></div>
            </div>
          </div>

          <Suspense fallback={<div className="auth-card">Загрузка формы...</div>}>
            <AuthForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
