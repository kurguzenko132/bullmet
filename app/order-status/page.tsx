import type { Metadata } from 'next';
import { OrderStatusPage } from '@/components/OrderStatusPage';

export const metadata: Metadata = {
  title: 'Статус заказа — Bullmet',
  description: 'Проверка статуса заказа Bullmet по номеру и телефону.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OrderStatusPage />;
}
