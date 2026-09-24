'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import type { HomeFeatureItem, HomeHeroSlide } from '@/lib/homepageControl';

type Props = {
  slides: HomeHeroSlide[];
  features: HomeFeatureItem[];
  autoplay: boolean;
  interval: number;
  showDots: boolean;
  showArrows: boolean;
  lazyImages: boolean;
  style?: CSSProperties;
};

function Lines({ value }: { value: string }) {
  return <>{value.split('\n').map((line, index) => <span key={`${line}-${index}`}>{line}</span>)}</>;
}

export function HomeHeroCarousel({ slides, features, autoplay, interval, showDots, showArrows, lazyImages, style }: Props) {
  const [active, setActive] = useState(0);
  const safeSlides = slides.length ? slides : [];
  const slide = safeSlides[active] || safeSlides[0];

  useEffect(() => {
    if (!autoplay || safeSlides.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % safeSlides.length), Math.max(3000, Math.min(10_000, interval || 5000)));
    return () => window.clearInterval(timer);
  }, [autoplay, interval, safeSlides.length]);

  useEffect(() => setActive((current) => Math.min(current, Math.max(0, safeSlides.length - 1))), [safeSlides.length]);
  if (!slide) return null;

  return <section className="hero-exact home-final-hero" style={style} aria-roledescription={safeSlides.length > 1 ? 'карусель' : undefined} aria-label="Главный слайд">
    <picture className="hero-background" aria-hidden="true"><img src={slide.image} alt="" className="hero-photo" loading={lazyImages ? 'lazy' : 'eager'} /></picture>
    <div className="hero-fade" />
    <div className="home-container hero-inner">
      <div className="hero-copy">
        <span className="home-hero-kicker">{slide.kicker}</span><h1>{slide.title}</h1><p>{slide.text}</p>
        <div className="hero-actions"><Link href={slide.primaryHref} className="btn-orange">{slide.primaryLabel}</Link></div>
        {safeSlides.length > 1 && <div className="home-hero-carousel-controls" aria-label="Навигация по слайдам">
          {showArrows && <button type="button" onClick={() => setActive((active - 1 + safeSlides.length) % safeSlides.length)} aria-label="Предыдущий слайд">‹</button>}
          {showDots && safeSlides.map((item, index) => <button type="button" key={item.id} className={index === active ? 'is-active' : ''} onClick={() => setActive(index)} aria-label={`Слайд ${index + 1}`} aria-current={index === active ? 'true' : undefined} />)}
          {showArrows && <button type="button" onClick={() => setActive((active + 1) % safeSlides.length)} aria-label="Следующий слайд">›</button>}
        </div>}
      </div>
      {!!features.length && <div className="hero-features" aria-label="Преимущества Bullmet">{features.map((item) => <div className="feature-item" key={item.id}><Icon name={item.icon as any} /><p><Lines value={item.text} /></p></div>)}</div>}
    </div>
  </section>;
}
