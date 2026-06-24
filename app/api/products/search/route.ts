import { NextRequest, NextResponse } from 'next/server';
import { getCatalogProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').toLowerCase().trim();
  const products = (await getCatalogProducts()).filter((product) => {
    const text = [product.title, product.slug, product.category, product.clockTheme].join(' ').toLowerCase();
    return text.includes('час') || Boolean(product.clockTheme);
  });
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
