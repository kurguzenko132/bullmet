import type { Metadata } from 'next';
import { AdminContentPage } from '@/components/AdminContentPage';

export const metadata: Metadata = {
  title: 'Настройки сайта — Bullmet Admin',
  robots: { index: false, follow: false },
  description: 'Настройки контактов, соцсетей и контента Bullmet.',
};

export default function Page() {
  return <AdminContentPage />;
}
