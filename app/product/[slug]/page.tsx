import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductDetailsClient } from '@/components/ProductDetailsClient';
import { getProductBySlug, getProductPageData } from '@/lib/products';

export const dynamic = 'force-dynamic';

type ProductPageProps = { params: { slug: string } };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Товар Bullmet', description: 'Товар Bullmet собственного изготовления.' };
  }

  return {
    title: `${product.title} — Bullmet`,
    description: product.description || product.short || 'Товар Bullmet собственного изготовления.',
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.title} — Bullmet`,
      description: product.description || product.short,
      images: [{ url: product.image, width: 1200, height: 630, alt: product.title }]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { product, related, colorVariants } = await getProductPageData(params.slug);
  if (!product) notFound();

  return (
    <>
      <Header />
      <main className="product-page-restored">
        <ProductDetailsClient product={product} related={related} colorVariants={colorVariants} />
      </main>
      <Footer />
    </>
  );
}
