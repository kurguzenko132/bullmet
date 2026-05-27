import type { Metadata } from 'next';
import { FavoritesPage } from '@/components/FavoritesPage';

export const metadata: Metadata = {
  title: 'Избранное — Bullmet',
  description: 'Сохраненные товары Bullmet: часы, декор, изделия из металла и дерева.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <FavoritesPage />;
}
