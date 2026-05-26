import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/SeoLandingPage';
import { seoLandings } from '@/components/seoLandingData';

const config = seoLandings['lazernaya-rezka-dereva'];

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: { canonical: '/lazernaya-rezka-dereva' },
  openGraph: {
    title: config.seoTitle,
    description: config.seoDescription,
    url: '/lazernaya-rezka-dereva',
    images: [config.image],
  },
};

export default function Page() {
  return <SeoLandingPage config={config} />;
}
