import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AccountClient } from '@/components/AccountClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Личный кабинет | Bullmet',
  description: 'Личный кабинет Bullmet: профиль, корзина, заказы, заявки и избранные товары.'
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
