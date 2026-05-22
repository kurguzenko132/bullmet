import Link from 'next/link';
import { Header, Footer } from './HomePage';
import { CheckoutContents } from './CheckoutContents';

export function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="checkoutPage">
        <section className="container catalogHero">
          <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><Link href="/cart">Корзина</Link><span>/</span><span>Оформление заказа</span></div>
          <h1 className="pageTitle">Оформление заказа</h1>
        </section>
        <CheckoutContents />
      </main>
      <Footer />
    </>
  );
}
