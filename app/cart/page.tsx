import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartClient } from '@/components/CartClient';

export const metadata = {
  title: 'Корзина Bullmet — оформление заказа',
  description: 'Корзина Bullmet: проверьте товары, измените количество и оформите заказ.'
};

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="cart-page-stage2">
        <section className="cart-page-hero-stage2">
          <nav aria-label="Хлебные крошки"><Link href="/">Главная</Link><span>›</span><span>Корзина</span></nav>
          <p className="section-kicker">Оформление заказа</p>
          <h1>Корзина</h1>
          <p>Проверьте товары, количество и оставьте контакты. Менеджер подтвердит стоимость, сроки изготовления и способ получения.</p>
        </section>
        <CartClient />
      </main>
      <Footer />
    </>
  );
}
