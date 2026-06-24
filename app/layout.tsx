import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Bullmet — настенные часы из металла с элементами дерева',
    template: '%s | Bullmet'
  },
  description: 'Настенные часы из металла с элементами дерева собственного производства Bullmet. Производство металлоизделий в Беларуси.',
  openGraph: {
    title: 'Bullmet — собственное производство',
    description: 'Настенные часы из металла с элементами дерева. Первый публичный запуск каталога Bullmet.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
