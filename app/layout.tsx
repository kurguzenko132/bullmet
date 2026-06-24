import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Bullmet — изделия из металла с элементами дерева',
    template: '%s | Bullmet'
  },
  description: 'ИЗГОТАВЛИВАЕМ: садовую мебель, мебель для дома в стиле лофт, качели, навесы, малые архитектурные формы, а также выполняем художественную лазерную резку из листового металла.',
  openGraph: {
    title: 'Bullmet — собственное производство',
    description: 'Изделия из металла с элементами дерева собственного производства Bullmet.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
