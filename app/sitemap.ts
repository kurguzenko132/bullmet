import type { MetadataRoute } from 'next';
import { products } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bullmet.by';
  const staticPages = ['', '/catalog', '/services', '/production', '/about', '/contacts'].map((url) => ({
    url: `${siteUrl}${url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: url === '' ? 1 : 0.8
  }));
  const productPages = products.filter((product) => [product.title, product.slug, product.category].join(' ').toLowerCase().includes('час')).map((product) => ({
    url: `${siteUrl}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }));
  return [...staticPages, ...productPages];
}
