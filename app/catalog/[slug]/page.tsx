import type { Metadata } from 'next';
import { ProductPage } from '@/components/ProductPage';
import { getProduct, products } from '@/components/shopData';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProduct(params.slug);
  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: `/catalog/${product.slug}` },
    openGraph: {
      title: `${product.title} — Bullmet`,
      description: product.description,
      url: `/catalog/${product.slug}`,
      images: [{ url: product.image, width: 1200, height: 630, alt: product.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} — Bullmet`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductPage slug={params.slug} />;
}
