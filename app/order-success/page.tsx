import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { OrderSuccessClient } from '@/components/OrderSuccessClient';

export const metadata = {
  title: 'Заказ оформлен | Bullmet',
  description: 'Спасибо за заказ Bullmet. Номер заказа и дальнейшие шаги.'
};

export default function OrderSuccessPage() {
  return (
    <>
      <Header />
      <main className="order-success-page-stage2">
        <OrderSuccessClient />
      </main>
      <Footer />
    </>
  );
}
