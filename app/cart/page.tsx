import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartClient } from '@/components/CartClient';

export const metadata = { title: 'Корзина Bullmet', description: 'Корзина товаров Bullmet.' };

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="container-page py-10">
        <p className="text-sm text-bull-muted">Главная › Корзина</p>
        <h1 className="mt-4 text-5xl font-black">Корзина</h1>
        <div className="mt-8"><CartClient /></div>
      </main>
      <Footer />
    </>
  );
}
