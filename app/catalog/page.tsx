import type { Metadata } from 'next';
import { CatalogPage } from '@/components/CatalogPage';

export const metadata: Metadata = {
  title: 'Каталог товаров',
  description: 'Каталог Bullmet: настенные часы, садовые качели, изделия из металла и дерева, элементы декора и услуги резки.',
  alternates: { canonical: '/catalog' },
};

export default function Page() {
  return <CatalogPage />;
}
