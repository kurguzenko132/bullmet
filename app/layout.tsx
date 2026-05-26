import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bullmet.by';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Bullmet — изделия из металла и дерева на заказ',
    template: '%s | Bullmet',
  },
  description: 'Bullmet производит настенные часы, садовые качели, изделия из металла и дерева, а также выполняет резку металла и дерева под заказ.',
  keywords: [
    'Bullmet',
    'изделия из металла',
    'изделия из дерева',
    'настенные часы',
    'садовые качели',
    'резка металла',
    'резка дерева',
    'изделия на заказ',
  ],
  applicationName: 'Bullmet',
  authors: [{ name: 'Bullmet' }],
  creator: 'Bullmet',
  publisher: 'Bullmet',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: '/',
    siteName: 'Bullmet',
    title: 'Bullmet — изделия из металла и дерева на заказ',
    description: 'Настенные часы, садовые качели, резка металла и дерева, индивидуальные изделия на заказ.',
    images: [
      {
        url: '/assets/hero-machine.jpg',
        width: 1200,
        height: 630,
        alt: 'Производство Bullmet',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bullmet — изделия из металла и дерева на заказ',
    description: 'Производство часов, садовых качелей, декора, резка металла и дерева.',
    images: ['/assets/hero-machine.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e65a12',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}<MobileBottomNav /></body>
    </html>
  );
}
