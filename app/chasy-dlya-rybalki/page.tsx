import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/SeoLandingPage';
import { seoLandings } from '@/components/seoLandingData';

const config = seoLandings['chasy-dlya-rybalki'];

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: { canonical: '/chasy-dlya-rybalki' },
  openGraph: {
    title: config.seoTitle,
    description: config.seoDescription,
    url: '/chasy-dlya-rybalki',
    images: [config.image],
  },
};

export default function Page() {
  return <SeoLandingPage config={config} />;
}
