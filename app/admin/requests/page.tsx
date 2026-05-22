import type { Metadata } from 'next';
import { AdminRequestsPage } from '@/components/AdminRequestsPage';

export const metadata: Metadata = {
  title: 'Заявки — Админ-панель Bullmet',
  robots: { index: false, follow: false },
  description: 'Заявки на расчет и индивидуальные заказы Bullmet.',
};

export default function Page() {
  return <AdminRequestsPage />;
}
