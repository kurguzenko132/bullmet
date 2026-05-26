import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/SeoLandingPage';
import { seoLandings } from '@/components/seoLandingData';

const config = seoLandings['nastennye-chasy-iz-metalla'];

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: { canonical: '/nastennye-chasy-iz-metalla' },
  openGraph: {
    title: config.seoTitle,
    description: config.seoDescription,
    url: '/nastennye-chasy-iz-metalla',
    images: [config.image],
  },
};

export default function Page() {
  return <SeoLandingPage config={config} />;
}
