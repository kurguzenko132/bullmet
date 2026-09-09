import Link from 'next/link';
import { Suspense } from 'react';
import { Clock3, Heart, ShoppingCart } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthForm } from '@/components/AuthForm';

export const metadata = {
  title: 'Вход в аккаунт | Bullmet',
  description: 'Вход и регистрация в личном кабинете Bullmet: заказы, избранное и удобное оформление.',
  robots: {
    index: false,
    follow: false
  }
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
              Личный кабинет для заказов, избранного и быстрого оформления. Всё необходимое для работы с Bullmet в одном месте.
            </p>
            <div className="auth-benefits">
              <article><ShoppingCart aria-hidden="true" /><b>Быстрое оформление</b><span>Сохраняйте данные и оформляйте заказы в несколько кликов.</span></article>
              <article><Clock3 aria-hidden="true" /><b>История заказов</b><span>Следите за статусом и возвращайтесь к прошлым заказам.</span></article>
              <article><Heart aria-hidden="true" /><b>Избранное и кабинет</b><span>Сохраняйте товары и управляйте своими данными.</span></article>
            </div>
            <p className="auth-signature" aria-hidden="true">Bullmet — металл с элементами дерева</p>
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
