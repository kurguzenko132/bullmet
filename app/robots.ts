import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';
import { getSiteControlSettings, visibleDirections } from '@/lib/siteControl';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = getSiteUrl();
  const site = await getSiteControlSettings();
  const hasServices = visibleDirections(site).some((direction) => direction.key !== 'clocks');

  if (!site.seo.robotsIndex) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${siteUrl}/sitemap.xml`
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/account/',
          '/login',
          ...(hasServices ? [] : ['/services'])
        ]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
