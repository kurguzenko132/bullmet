import Link from 'next/link';
import { Header, Footer } from './HomePage';
import { CartContents } from './CartContents';

export function CartPage() {
  return (
    <>
      <Header />
      <main className="cartPage">
        <section className="container catalogHero">
          <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Корзина</span></div>
          <h1 className="pageTitle">Корзина</h1>
        </section>
        <CartContents />
      </main>
      <Footer />
    </>
  );
}
