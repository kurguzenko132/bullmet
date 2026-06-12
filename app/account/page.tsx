import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AccountClient } from '@/components/AccountClient';

export const metadata = {
  title: 'Личный кабинет | Bullmet',
  description: 'Личный кабинет Bullmet: корзина, заявки и быстрый переход к заказам.'
};

export default function AccountPage() {
  return (
    <>
      <Header />
      <main className="account-page">
        <AccountClient />
      </main>
      <Footer />
    </>
  );
}
