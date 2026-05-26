import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/SeoLandingPage';
import { seoLandings } from '@/components/seoLandingData';

const config = seoLandings['lazernaya-rezka-metalla'];

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: { canonical: '/lazernaya-rezka-metalla' },
  openGraph: {
    title: config.seoTitle,
    description: config.seoDescription,
    url: '/lazernaya-rezka-metalla',
    images: [config.image],
  },
};

export default function Page() {
  return <SeoLandingPage config={config} />;
}
