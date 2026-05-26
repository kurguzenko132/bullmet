import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/SeoLandingPage';
import { seoLandings } from '@/components/seoLandingData';

const config = seoLandings['chasy-dlya-bani'];

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: { canonical: '/chasy-dlya-bani' },
  openGraph: {
    title: config.seoTitle,
    description: config.seoDescription,
    url: '/chasy-dlya-bani',
    images: [config.image],
  },
};

export default function Page() {
  return <SeoLandingPage config={config} />;
}
