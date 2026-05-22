import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bullmet.by';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/catalog', '/catalog/', '/request', '/contacts', '/delivery', '/payment', '/returns', '/privacy'],
        disallow: ['/admin', '/account', '/cart', '/checkout', '/login', '/register'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
