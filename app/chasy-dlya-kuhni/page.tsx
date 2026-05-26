import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/SeoLandingPage';
import { seoLandings } from '@/components/seoLandingData';

const config = seoLandings['chasy-dlya-kuhni'];

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: { canonical: '/chasy-dlya-kuhni' },
  openGraph: {
    title: config.seoTitle,
    description: config.seoDescription,
    url: '/chasy-dlya-kuhni',
    images: [config.image],
  },
};

export default function Page() {
  return <SeoLandingPage config={config} />;
}
