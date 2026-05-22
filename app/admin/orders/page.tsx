import type { Metadata } from 'next';
import { AdminOrdersPage } from '@/components/AdminOrdersPage';

export const metadata: Metadata = {
  title: 'Заказы — Админ-панель Bullmet',
  robots: { index: false, follow: false },
  description: 'Управление заказами интернет-магазина Bullmet.',
};

export default function Page() {
  return <AdminOrdersPage />;
}
