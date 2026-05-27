import type { Metadata } from 'next';
import { AdminSystemSettingsPage } from '@/components/AdminSystemSettingsPage';

export const metadata: Metadata = {
  title: 'Системные настройки — Bullmet Admin',
  robots: { index: false, follow: false },
  description: 'Системные настройки Bullmet: режим сайта, валюта, заказы и интеграции.',
};

export default function Page() {
  return <AdminSystemSettingsPage />;
}
