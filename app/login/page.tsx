import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Icon } from '@/components/Icon';

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
          </div>

          <section className="auth-card" aria-label="Форма входа и регистрации">
            <div className="auth-tabs">
              <button className="active" type="button">Вход</button>
              <button type="button">Регистрация</button>
            </div>

            <form className="auth-form">
              <label>
                Email или телефон
                <input type="text" placeholder="Введите email или телефон" />
              </label>
              <label>
                Пароль
                <input type="password" placeholder="Введите пароль" />
              </label>
              <button type="button" className="auth-submit">ВОЙТИ В АККАУНТ</button>
              <div className="auth-links">
                <Link href="/contacts">Забыли пароль?</Link>
                <Link href="/catalog">Вернуться в каталог</Link>
              </div>
            </form>

            <p className="auth-note">
              Пока это визуальный макет. После подключения Supabase здесь будет полноценный вход,
              регистрация и роли пользователя/администратора.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
