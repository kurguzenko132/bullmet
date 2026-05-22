import type { MetadataRoute } from 'next';
import { products } from '@/components/shopData';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bullmet.by';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/catalog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/request`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${siteUrl}/contacts`, lastModified: now, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${siteUrl}/delivery`, lastModified: now, changeFrequency: 'monthly', priority: 0.55 },
    { url: `${siteUrl}/payment`, lastModified: now, changeFrequency: 'monthly', priority: 0.55 },
    { url: `${siteUrl}/returns`, lastModified: now, changeFrequency: 'monthly', priority: 0.45 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.35 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/catalog/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
