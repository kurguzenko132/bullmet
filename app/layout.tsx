import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Bullmet — изделия из металла с элементами дерева собственного производства',
    template: '%s | Bullmet'
  },
  description: 'Садовая мебель, мебель в стиле лофт, качели, навесы, художественная лазерная резка из листового металла под заказ. Собственное производство Bullmet.',
  openGraph: {
    title: 'Bullmet — собственное производство',
    description: 'Изделия из металла с элементами дерева, каталог, резка и индивидуальные заказы.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
