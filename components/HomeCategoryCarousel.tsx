'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { CategoryCard } from '@/components/cards/CategoryCard';

type Category = {
  id: string;
  title: string;
  description: string;
  img: string;
  href: string;
};

export function HomeCategoryCarousel({ categories }: { categories: Category[] }) {
  const railRef = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    const firstCard = rail.querySelector<HTMLElement>('.category-card');
    const gap = Number.parseFloat(window.getComputedStyle(rail).gap) || 0;
    const step = firstCard ? firstCard.offsetWidth + gap : 280;
    rail.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  return <>
    <div className="home-categories-head">
      <h2>Выберите стиль,<br />который вам ближе</h2>
      <div className="home-categories-actions">
        <Link className="home-categories-all" href="/catalog">Смотреть все категории <span aria-hidden="true">→</span></Link>
        <div className="home-categories-controls" aria-label="Прокрутка категорий">
          <button type="button" onClick={() => scroll(-1)} aria-label="Предыдущие категории"><ArrowLeft aria-hidden="true" /></button>
          <button type="button" onClick={() => scroll(1)} aria-label="Следующие категории"><ArrowRight aria-hidden="true" /></button>
        </div>
      </div>
    </div>
    <div ref={railRef} className="category-grid-exact category-grid-final">
      {categories.map((item) => <CategoryCard description={item.description} href={item.href} image={item.img} key={item.id} title={item.title} />)}
    </div>
  </>;
}
