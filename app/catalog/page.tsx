import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CatalogClient } from '@/components/CatalogClient';
import { HomePromoBanners } from '@/components/HomePromoBanners';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { getCatalogProducts, getProductReviewStats, isPublicCatalogProduct } from '@/lib/products';
import { filterableCatalogCategories, getCatalogControlSettings, isProductCategoryPublic } from '@/lib/catalogControl';
import { getSiteControlSettings, isClocksOnly } from '@/lib/siteControl';
import { getReviewControlSettings } from '@/lib/reviewControl';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ category?: string; q?: string; search?: string; priceFrom?: string; priceTo?: string; material?: string; sort?: string }> }): Promise<Metadata> {
  const [site, catalog, query] = await Promise.all([getSiteControlSettings(), getCatalogControlSettings(), searchParams]);
  const categorySlug = String(query?.category || '');
  const category = catalog.enabled ? filterableCatalogCategories(catalog, 'clock').find((item) => item.slug === categorySlug) : undefined;
  const hasExtraQuery = Boolean(query?.q || query?.search || query?.priceFrom || query?.priceTo || query?.material || query?.sort || (categorySlug && !category));
  const title = category?.seoTitle || (category ? `${category.title} — каталог Bullmet` : site.seo.defaultTitle || 'Каталог настенных часов Bullmet');
  const description = category?.seoDescription || category?.description || site.seo.defaultDescription || 'Каталог Bullmet: настенные часы из металла с элементами дерева собственного производства.';
  return {
    title,
    description,
    alternates: { canonical: category ? `/catalog?category=${encodeURIComponent(category.slug)}` : '/catalog' },
    robots: site.seo.robotsIndex && !hasExtraQuery ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      images: category?.ogImage ? [category.ogImage] : site.seo.ogImage ? [site.seo.ogImage] : undefined
    }
  };
}

export default async function CatalogPage({ searchParams }: {
  searchParams?: Promise<{
    q?: string;
    search?: string;
    category?: string;
    priceFrom?: string;
    priceTo?: string;
    material?: string;
    sort?: string;
  }>;
}) {
  const query = await searchParams;
  const [allProducts, categorySettings, site, reviewSettings] = await Promise.all([
    getCatalogProducts(),
    getCatalogControlSettings(),
    getSiteControlSettings(),
    getReviewControlSettings()
  ]);

  const visibleClockCategories = filterableCatalogCategories(categorySettings, 'clock');
  const products = allProducts.filter((product) => isPublicCatalogProduct(product, { clocksOnly: isClocksOnly(site), categoryPublic: isProductCategoryPublic(categorySettings, product) }));

  const reviewStats = await getProductReviewStats(products.map((product) => product.slug));
  const categories = Array.from(new Set(products.flatMap((product) => [product.category, product.clockTheme]).filter((item): item is string => Boolean(item))));

  return (
    <>
      <Header />
      <main className="catalog-page catalog-page--improved">
        <Container className="catalog-container">
          <nav className="catalog-breadcrumbs" aria-label="Хлебные крошки">
            <Link href="/">Главная</Link>
            <span>›</span>
            <span>Каталог</span>
          </nav>

          <SectionHeader eyebrow="Каталог Bullmet" headingLevel="h1" title="Каталог настенных часов" description="Изделия из металла с элементами дерева собственного производства." />
          <HomePromoBanners placement="catalog_top" />
          <CatalogClient
            products={products}
            reviewStats={reviewStats}
            reviewSettings={reviewSettings}
            categories={categories}
            initialQuery={query?.search || query?.q || ''}
            initialCategory={query?.category || ''}
            initialMaterial={query?.material || ''}
            initialPriceFrom={query?.priceFrom || ''}
            initialPriceTo={query?.priceTo || ''}
            initialSort={query?.sort || 'popular'}
          />
        </Container>
      </main>
      <Footer />
    </>
  );
}
