import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';
import { getSiteControlSettings } from '@/lib/siteControl';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteControlSettings();
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: site.seo.defaultTitle || 'Bullmet — изделия из металла с элементами дерева',
      template: `%s | ${site.general.siteName || 'Bullmet'}`
    },
    description: site.seo.defaultDescription || 'Изделия из металла с элементами дерева собственного производства Bullmet.',
    robots: site.seo.robotsIndex ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: site.seo.defaultTitle || 'Bullmet — собственное производство',
      description: site.seo.defaultDescription || 'Изделия из металла с элементами дерева собственного производства Bullmet.',
      type: 'website',
      images: site.seo.ogImage ? [site.seo.ogImage] : undefined
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
