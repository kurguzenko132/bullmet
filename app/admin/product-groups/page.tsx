import type { Metadata } from 'next';
import { AdminProductGroupsPage } from '@/components/AdminProductGroupsPage';

export const metadata: Metadata = {
  title: 'Группы товаров — Админ-панель Bullmet',
  robots: { index: false, follow: false },
  description: 'Объединение товаров Bullmet в группы цветов и моделей.',
};

export default function Page() {
  return <AdminProductGroupsPage />;
}
