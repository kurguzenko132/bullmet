import type { Metadata } from 'next';
import { ProductPage } from '@/components/ProductPage';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  return {
    title: 'Товар Bullmet',
    description: 'Карточка товара Bullmet: изделия из металла и дерева, часы, качели, декор и производство на заказ.',
    alternates: { canonical: `/catalog/${params.slug}` },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductPage slug={params.slug} />;
}
