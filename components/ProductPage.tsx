'use client';

import Link from 'next/link';
import { Header, Footer } from './HomePage';
import { getProduct, products } from './shopData';
import { useAdminProducts } from './useAdminProducts';
import { ProductDetails, ProductServiceStrip, RelatedProducts } from './ProductDetails';

export function ProductPage({ slug }: { slug: string }) {
  const { items, ready } = useAdminProducts();
  const sourceProducts = ready ? items.filter((item) => item.status !== 'draft') : products;
  const product = sourceProducts.find((item) => item.slug === slug) ?? getProduct(slug);
  const related = sourceProducts.filter((item) => item.slug !== product.slug && item.category === product.category).concat(sourceProducts.filter((item) => item.slug !== product.slug));

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
