import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/SeoLandingPage';
import { seoLandings } from '@/components/seoLandingData';

const config = seoLandings['nastennye-chasy-iz-dereva'];

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: { canonical: '/nastennye-chasy-iz-dereva' },
  openGraph: {
    title: config.seoTitle,
    description: config.seoDescription,
    url: '/nastennye-chasy-iz-dereva',
    images: [config.image],
  },
};

export default function Page() {
  return <SeoLandingPage config={config} />;
}
