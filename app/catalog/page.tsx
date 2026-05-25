import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogPage } from '@/components/CatalogPage';

export const metadata: Metadata = {
  title: 'Каталог товаров',
  description: 'Каталог Bullmet: настенные часы, садовые качели, изделия из металла и дерева, элементы декора и услуги резки.',
  alternates: { canonical: '/catalog' },
};

function CatalogFallback() {
  return (
    <main className="catalogPage">
      <section className="container catalogHero">
        <div className="breadcrumbs"><span>Главная</span><span>/</span><span>Каталог</span></div>
        <h1 className="pageTitle">Каталог товаров</h1>
      </section>
      <section className="container catalogLayout">
        <div className="catalogLoading">Загружаем каталог...</div>
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogPage />
    </Suspense>
  );
}
