import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Админ-панель — Bullmet',
  robots: { index: false, follow: false },
  description: 'Панель управления интернет-магазином Bullmet.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
