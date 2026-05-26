import type { Metadata } from 'next';
import { AdminReviewsPage } from '@/components/AdminReviewsPage';

export const metadata: Metadata = {
  title: 'Отзывы — Админ-панель Bullmet',
  robots: { index: false, follow: false },
  description: 'Модерация отзывов покупателей Bullmet.',
};

export default function Page() {
  return <AdminReviewsPage />;
}
