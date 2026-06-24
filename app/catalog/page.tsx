import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CatalogClient } from '@/components/CatalogClient';
import { clockCatalogCategories, getCatalogProducts, getProductReviewStats } from '@/lib/products';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Каталог настенных часов Bullmet',
  description: 'Каталог Bullmet: настенные часы из металла с элементами дерева собственного производства.'
};

export default async function CatalogPage({ searchParams }: { searchParams?: { q?: string; category?: string } }) {
  const allProducts = await getCatalogProducts();
  const products = allProducts.filter((product) => {
    const text = [product.title, product.category, product.clockTheme, product.slug].join(' ').toLowerCase();
    return text.includes('час') || Boolean(product.clockTheme);
  });
  const reviewStats = await getProductReviewStats(products.map((product) => product.slug));
  const categories = Array.from(new Set([...clockCatalogCategories, ...products.map((product) => product.category).filter((item): item is string => Boolean(item))]));

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
