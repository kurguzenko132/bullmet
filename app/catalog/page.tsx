import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CatalogClient } from '@/components/CatalogClient';
import { getCatalogProducts, getProductReviewStats } from '@/lib/products';
import { getCatalogControlSettings, visibleCatalogCategories } from '@/lib/catalogControl';
import { getSiteControlSettings } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteControlSettings();
  return {
    title: site.seo.defaultTitle || 'Каталог настенных часов Bullmet',
    description: site.seo.defaultDescription || 'Каталог Bullmet: настенные часы из металла с элементами дерева собственного производства.',
    robots: site.seo.robotsIndex ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: site.seo.defaultTitle,
      description: site.seo.defaultDescription,
      images: site.seo.ogImage ? [site.seo.ogImage] : undefined
    }
  };
}

export default async function CatalogPage({ searchParams }: {
  searchParams?: {
    q?: string;
    search?: string;
    category?: string;
    priceFrom?: string;
    priceTo?: string;
    material?: string;
    sort?: string;
  };
}) {
  const [allProducts, categorySettings] = await Promise.all([
    getCatalogProducts(),
    getCatalogControlSettings()
  ]);

  const visibleClockCategories = visibleCatalogCategories(categorySettings, 'clock');
  const products = allProducts.filter((product) => product.status !== 'hidden');

  const reviewStats = await getProductReviewStats(products.map((product) => product.slug));
  const categories = Array.from(new Set([
    ...products.map((product) => product.category),
    ...(categorySettings.enabled ? visibleClockCategories.map((category) => category.slug) : [])
  ].filter((item): item is string => Boolean(item))));

  return (
    <>
      <Header />
      <main className="catalog-page catalog-page--improved">
        <div className="catalog-container">
          <nav className="catalog-breadcrumbs" aria-label="Хлебные крошки">
            <Link href="/">Главная</Link>
            <span>›</span>
            <span>Каталог</span>
          </nav>

          <h1 className="catalog-title">Каталог товаров</h1>
          <CatalogClient
            products={products}
            reviewStats={reviewStats}
            categories={categories}
            initialQuery={searchParams?.search || searchParams?.q || ''}
            initialCategory={searchParams?.category || ''}
            initialMaterial={searchParams?.material || ''}
            initialPriceFrom={searchParams?.priceFrom || ''}
            initialPriceTo={searchParams?.priceTo || ''}
            initialSort={searchParams?.sort || 'popular'}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
