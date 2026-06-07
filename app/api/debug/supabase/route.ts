import { NextResponse } from 'next/server';
import { getCatalogProducts } from '@/lib/products';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      ok: false,
      configured: false,
      productsCount: 0,
      message: 'Supabase env variables are missing or still placeholders. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.'
    }, { status: 200 });
  }

  const { error: tableError, count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true });

  const products = await getCatalogProducts();
  const fallbackDetected = products.some((product) => product.slug === 'nastennye-chasy-loft');

  return NextResponse.json({
    ok: !tableError,
    configured: true,
    productsTableReadable: !tableError,
    rawProductsCount: count ?? null,
    displayedProductsCount: products.length,
    fallbackLikelyShown: fallbackDetected && (count === 0 || count === null),
    error: tableError?.message || null,
    firstProduct: products[0] ? { slug: products[0].slug, title: products[0].title, image: products[0].image } : null
  });
}
