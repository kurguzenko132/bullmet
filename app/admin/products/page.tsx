import type { Metadata } from 'next';
import { AdminProductsPage } from '@/components/AdminProductsPage';

export const metadata: Metadata = {
  title: 'Товары — Админ-панель Bullmet',
  robots: { index: false, follow: false },
  description: 'Управление товарами интернет-магазина Bullmet.',
};

export default function Page() {
  return <AdminProductsPage />;
}
