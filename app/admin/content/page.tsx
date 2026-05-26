import type { Metadata } from 'next';
import { AdminContentPage } from '@/components/AdminContentPage';

export const metadata: Metadata = {
  title: 'Контент сайта — Bullmet Admin',
  robots: { index: false, follow: false },
  description: 'Редактирование текстов, контактов, соцсетей и FAQ сайта Bullmet.',
};

export default function Page() {
  return <AdminContentPage />;
}
