'use client';

import Link from 'next/link';
import { Header, Footer } from './HomePage';

import { useAdminProducts } from './useAdminProducts';
import { ProductDetails, ProductServiceStrip, RelatedProducts } from './ProductDetails';
import { expandProductVariants, findProductByVariantSlug } from './shopData';

export function ProductPage({ slug }: { slug: string }) {
  const { items, ready } = useAdminProducts();
  const sourceProducts = ready ? items.filter((item) => item.status !== 'draft') : [];
  const product = findProductByVariantSlug(sourceProducts, slug);

  if (ready && !product) {
    return (
      <>
        <Header />
        <main className="productPage">
          <section className="container productMissing">
            <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><Link href="/catalog">Каталог</Link></div>
            <h1 className="pageTitle">Товар не найден</h1>
            <p>Этот товар удален из админки или пока не опубликован.</p>
            <Link className="button button--orange" href="/catalog">Вернуться в каталог</Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  const expanded = expandProductVariants(sourceProducts);
  const related = expanded.filter((item) => item.slug !== product.slug && item.category === product.category).concat(expanded.filter((item) => item.slug !== product.slug));

  return (
    <>
      <Header />
      <main className="productPage">
        <section className="container productBreadcrumbs">
          <Link href="/">Главная</Link><span>/</span><Link href="/catalog">Каталог</Link><span>/</span><span>{product.category}</span><span>/</span><span>{product.title}</span>
        </section>
        <ProductDetails product={product} />
        <ProductServiceStrip />
        <RelatedProducts products={related} />
      </main>
      <Footer />
    </>
  );
}
