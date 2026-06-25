import Link from 'next/link';
import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { AuthForm } from '@/components/AuthForm';

export const metadata = {
  title: 'Вход в аккаунт | Bullmet',
  description: 'Войти в личный кабинет или админ-панель Bullmet.'
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-info">
            <p className="auth-eyebrow">Аккаунт Bullmet</p>
            <h1>Войти в аккаунт</h1>
            <p>
              Для клиента откроется личный кабинет, для администратора — панель управления сайтом.
            </p>
            <div className="auth-benefits">
              <div><Icon name="cart" /><span>Быстрое оформление</span></div>
              <div><Icon name="clock" /><span>Заказы часов</span></div>
              <div><Icon name="shield" /><span>Доступ к админке</span></div>
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
