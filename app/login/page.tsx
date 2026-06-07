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
            <h1>Вход или регистрация</h1>
            <p>
              В личном кабинете покупатель сможет отслеживать заказы, сохранять товары,
              быстрее отправлять заявки на расчет и повторять прошлые покупки.
            </p>
            <div className="auth-benefits">
              <div><Icon name="cart" /><span>История заказов</span></div>
              <div><Icon name="request" /><span>Заявки на расчет</span></div>
              <div><Icon name="package" /><span>Статусы доставки</span></div>
            </div>
            <p className="auth-admin-link">
              Администратор? <Link href="/login?next=/admin">Войти в панель управления</Link>
            </p>
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
