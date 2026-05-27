'use client';

import Link from 'next/link';
import { Header, Footer } from './HomePage';

import { useAdminProducts } from './useAdminProducts';
import { ProductDetails, ProductFaqBlock, ProductReviewsBlock, ProductServiceStrip, RelatedProducts } from './ProductDetails';
import { expandProductVariants, findProductByVariantSlug, getProductGroup, productToColorVariant } from './shopData';

export function ProductPage({ slug }: { slug: string }) {
  const { items, ready } = useAdminProducts();
  const sourceProducts = ready ? items.filter((item) => item.status !== 'draft') : [];
  const baseProduct = findProductByVariantSlug(sourceProducts, slug);
  const group = baseProduct ? getProductGroup(sourceProducts, baseProduct) : [];
  const product = baseProduct ? { ...baseProduct, variants: group.length > 1 ? group.map(productToColorVariant) : [], activeVariantId: baseProduct.slug, variantName: baseProduct.colorName, variantColorHex: baseProduct.colorHex } : null;

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
        <ProductJsonLd product={product} />
        <ProductDetails product={product} />
        <ProductServiceStrip />
        <ProductReviewsBlock productSlug={product.slug} />
        <ProductFaqBlock />
        <RelatedProducts products={related} />
      </main>
      <Footer />
    </>
  );
}


function ProductJsonLd({ product }: { product: any }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images?.length ? product.images : [product.image],
    description: product.description || product.short,
    brand: { '@type': 'Brand', name: 'Bullmet' },
    material: product.material,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BYN',
      price: product.price,
      availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: typeof window !== 'undefined' ? window.location.href : `/catalog/${product.slug}`,
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
