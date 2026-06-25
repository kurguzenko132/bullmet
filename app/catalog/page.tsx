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

export default async function CatalogPage({ searchParams }: { searchParams?: { q?: string; category?: string } }) {
  const [allProducts, categorySettings] = await Promise.all([
    getCatalogProducts(),
    getCatalogControlSettings()
  ]);

  const visibleClockCategories = visibleCatalogCategories(categorySettings, 'clock');
  const visibleCategoryValues = new Set(visibleClockCategories.map((category) => category.slug));

  const products = allProducts.filter((product) => {
    const text = [product.title, product.category, product.clockTheme, product.slug].join(' ').toLowerCase();
    const isClock = text.includes('час') || Boolean(product.clockTheme);
    const categoryAllowed = !categorySettings.enabled || !visibleCategoryValues.size || visibleCategoryValues.has(product.category || '') || visibleCategoryValues.has(product.clockTheme || '');
    return isClock && categoryAllowed;
  });

  const reviewStats = await getProductReviewStats(products.map((product) => product.slug));
  const categories = categorySettings.enabled && visibleClockCategories.length
    ? visibleClockCategories.map((category) => category.slug)
    : Array.from(new Set(products.map((product) => product.category).filter((item): item is string => Boolean(item))));

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

          <h1 className="catalog-title">Каталог настенных часов</h1>
          <CatalogClient products={products} reviewStats={reviewStats} categories={categories} initialQuery={searchParams?.q || ''} initialCategory={searchParams?.category || ''} />
        </div>
      </main>
      <Footer />
    </>
  );
}
