import type { Metadata } from 'next';
import { AdminProductForm } from '@/components/AdminProductForm';

export const metadata: Metadata = {
  title: 'Добавить товар — Bullmet',
};

export default function Page() {
  return <AdminProductForm />;
}
