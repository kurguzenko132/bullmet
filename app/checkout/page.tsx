import type { Metadata } from 'next';
import { CheckoutPage } from '@/components/CheckoutPage';

export const metadata: Metadata = {
  title: 'Оформление заказа',
  description: 'Оформление заказа в интернет-магазине Bullmet.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CheckoutPage />;
}
