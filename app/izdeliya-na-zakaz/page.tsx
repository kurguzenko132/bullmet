import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/SeoLandingPage';
import { seoLandings } from '@/components/seoLandingData';

const config = seoLandings['izdeliya-na-zakaz'];

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: { canonical: '/izdeliya-na-zakaz' },
  openGraph: {
    title: config.seoTitle,
    description: config.seoDescription,
    url: '/izdeliya-na-zakaz',
    images: [config.image],
  },
};

export default function Page() {
  return <SeoLandingPage config={config} />;
}
