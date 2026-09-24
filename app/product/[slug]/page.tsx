import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductDetailsClient } from '@/components/ProductDetailsClient';
import { HomePromoBanners } from '@/components/HomePromoBanners';
import { getProductBySlug, getProductPageData } from '@/lib/products';
import { getReviewControlSettings } from '@/lib/reviewControl';
import { getSiteControlSettings } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, site] = await Promise.all([getProductBySlug(slug), getSiteControlSettings()]);
  if (!product) {
    return { title: 'Товар Bullmet', description: 'Товар Bullmet собственного изготовления.' };
  }

  return {
    title: product.seoTitle || `${product.title} — Bullmet`,
    description: product.seoDescription || product.description || product.short || 'Товар Bullmet собственного изготовления.',
    alternates: { canonical: `/product/${product.slug}` },
    robots: site.seo.robotsIndex ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: product.seoTitle || `${product.title} — Bullmet`,
      description: product.seoDescription || product.description || product.short,
      images: [{ url: product.image, width: 1200, height: 630, alt: product.title }]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [{ product, related, colorVariants }, reviewSettings] = await Promise.all([getProductPageData(slug), getReviewControlSettings()]);
  if (!product) notFound();

  return (
    <>
      <Header />
      <main className="product-page-restored">
        <ProductDetailsClient product={product} related={related} colorVariants={colorVariants} reviewSettings={reviewSettings} />
        <HomePromoBanners placement="product_bottom" />
      </main>
      <Footer />
    </>
  );
}
