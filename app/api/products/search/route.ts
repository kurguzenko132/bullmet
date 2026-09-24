import { NextRequest, NextResponse } from 'next/server';
import { getCatalogProducts, isPublicCatalogProduct } from '@/lib/products';
import { getCatalogControlSettings, isProductCategoryPublic } from '@/lib/catalogControl';
import { getSiteControlSettings, isClocksOnly } from '@/lib/siteControl';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').toLowerCase().trim();
  const [allProducts, site, catalog] = await Promise.all([getCatalogProducts(), getSiteControlSettings(), getCatalogControlSettings()]);
  const products = allProducts.filter((product) => isPublicCatalogProduct(product, { clocksOnly: isClocksOnly(site), categoryPublic: isProductCategoryPublic(catalog, product) }));
  const result = products
    .filter((product) => !q || [product.title, product.slug, product.category, product.clockTheme, product.short, product.material].join(' ').toLowerCase().includes(q))
    .slice(0, 8)
    .map((product) => ({
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      short: product.short
    }));

  return NextResponse.json({ ok: true, products: result });
}
