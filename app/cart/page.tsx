import type { Metadata } from 'next';
import { CartPage } from '@/components/CartPage';

export const metadata: Metadata = {
  title: 'Корзина',
  description: 'Корзина интернет-магазина Bullmet.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CartPage />;
}
