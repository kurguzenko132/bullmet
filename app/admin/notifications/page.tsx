import type { Metadata } from 'next';
import { AdminNotificationsPage } from '@/components/AdminNotificationsPage';

export const metadata: Metadata = {
  title: 'Уведомления — Админ-панель Bullmet',
  robots: { index: false, follow: false },
  description: 'Уведомления о заказах, заявках, отзывах и Telegram-интеграция Bullmet.',
};

export default function Page() {
  return <AdminNotificationsPage />;
}
