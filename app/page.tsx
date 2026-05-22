import type { Metadata } from 'next';
import { HomePage } from '@/components/HomePage';

export const metadata: Metadata = {
  title: 'Bullmet — изделия из металла и дерева на заказ',
  description: 'Настенные часы, садовые качели, резка металла и дерева, декор и индивидуальные изделия от собственного производства Bullmet.',
  alternates: { canonical: '/' },
};

export default function Page() {
  return <HomePage />;
}
