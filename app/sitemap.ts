import type { MetadataRoute } from 'next';
import { getCatalogControlSettings, visibleCatalogCategories } from '@/lib/catalogControl';
import { getCatalogProducts, isPublicClockProduct } from '@/lib/products';
import { getSiteControlSettings, visibleDirections } from '@/lib/siteControl';
import { getPublishedSitePages } from '@/lib/sitePages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bullmet.by';
  const [site, catalog, products, cmsPages] = await Promise.all([
    getSiteControlSettings(),
    getCatalogControlSettings(),
    getCatalogProducts(),
    getPublishedSitePages()
  ]);

  if (!site.seo.robotsIndex) return [];

  const activeDirections = visibleDirections(site);
  const hasServices = activeDirections.some((direction) => direction.key !== 'clocks');
  const visibleClockCategories = visibleCatalogCategories(catalog, 'clock');
  const visibleCategoryValues = new Set(visibleClockCategories.map((category) => category.slug));

  const staticPageUrls = ['', '/catalog', '/production', '/about', '/contacts'];
  if (hasServices) staticPageUrls.push('/services');

  const staticPages = staticPageUrls.map((url) => ({
    url: `${siteUrl}${url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: url === '' ? 1 : 0.8
  }));

  const categoryPages = visibleClockCategories.map((category) => ({
    url: `${siteUrl}/catalog?category=${encodeURIComponent(category.slug)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.65
  }));

  const cmsPageUrls = cmsPages.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));

  const productPages = products
    .filter(isPublicClockProduct)
    .filter((product) => !catalog.enabled || !visibleCategoryValues.size || visibleCategoryValues.has(product.category || '') || visibleCategoryValues.has(product.clockTheme || ''))
    .map((product) => ({
      url: `${siteUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }));

  return [...staticPages, ...categoryPages, ...cmsPageUrls, ...productPages];
}
