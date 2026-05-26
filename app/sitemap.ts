import type { MetadataRoute } from 'next';
import { products } from '@/components/shopData';
import { seoLandingList } from '@/components/seoLandingData';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bullmet.by';

type ProductSitemapRow = {
  slug: string;
  status?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

async function getProductSitemapRows(): Promise<ProductSitemapRow[]> {
  const baseRows = products.map((product) => ({ slug: product.slug }));

  if (!isSupabaseConfigured || !supabase) return baseRows;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('slug,status,updated_at,created_at')
      .neq('status', 'draft');

    if (error) throw error;
    const dbRows = Array.isArray(data) ? data as ProductSitemapRow[] : [];
    return [...baseRows, ...dbRows];
  } catch (error) {
    console.warn('Sitemap products fallback to static products:', error);
    return baseRows;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/catalog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/request`, lastModified: now, changeFrequency: 'monthly', priority: 0.78 },
    { url: `${siteUrl}/production`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.82 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${siteUrl}/contacts`, lastModified: now, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${siteUrl}/delivery`, lastModified: now, changeFrequency: 'monthly', priority: 0.55 },
    { url: `${siteUrl}/payment`, lastModified: now, changeFrequency: 'monthly', priority: 0.55 },
    { url: `${siteUrl}/returns`, lastModified: now, changeFrequency: 'monthly', priority: 0.45 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.35 },
  ];

  const landingPages: MetadataRoute.Sitemap = seoLandingList.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: page.slug.includes('chasy') ? 0.84 : 0.82,
  }));

  const rows = await getProductSitemapRows();
  const productMap = new Map<string, ProductSitemapRow>();
  rows.forEach((row) => {
    if (row.slug) productMap.set(row.slug, row);
  });

  const productPages: MetadataRoute.Sitemap = Array.from(productMap.values()).map((product) => ({
    url: `${siteUrl}/catalog/${product.slug}`,
    lastModified: product.updated_at || product.created_at ? new Date(product.updated_at || product.created_at!) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...landingPages, ...productPages];
}
