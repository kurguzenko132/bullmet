import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartClient } from '@/components/CartClient';
import { getCatalogProducts } from '@/lib/products';

export const metadata = {
  title: 'Корзина Bullmet — оформление заказа',
  description: 'Корзина Bullmet: проверьте товары, измените количество и оформите заказ.',
  robots: { index: false, follow: false }
};

export default async function CartPage() {
  const products = (await getCatalogProducts()).filter((product) => product.status !== 'hidden');
  return (
    <>
      <Header />
      <main className="cart-page-stage2">
        <section className="cart-page-hero-stage2">
          <nav aria-label="Хлебные крошки"><Link href="/">Главная</Link><span>›</span><span>Корзина</span></nav>
          <p className="section-kicker">Оформление заказа</p>
          <h1>Ваша корзина</h1>
          <p>Проверьте товары, количество и данные перед оформлением заказа.</p>
        </section>
        <CartClient recommendations={products} />
      </main>
      <Footer />
    </>
  );
}
