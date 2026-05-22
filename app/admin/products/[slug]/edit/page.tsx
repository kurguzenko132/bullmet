import type { Metadata } from 'next';
import { AdminProductForm } from '@/components/AdminProductForm';

export const metadata: Metadata = {
  title: 'Редактировать товар — Bullmet',
};

export default function Page({ params }: { params: { slug: string } }) {
  return <AdminProductForm slug={params.slug} />;
}
