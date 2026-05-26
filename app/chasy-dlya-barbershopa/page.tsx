import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/SeoLandingPage';
import { seoLandings } from '@/components/seoLandingData';

const config = seoLandings['chasy-dlya-barbershopa'];

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: { canonical: '/chasy-dlya-barbershopa' },
  openGraph: {
    title: config.seoTitle,
    description: config.seoDescription,
    url: '/chasy-dlya-barbershopa',
    images: [config.image],
  },
};

export default function Page() {
  return <SeoLandingPage config={config} />;
}
