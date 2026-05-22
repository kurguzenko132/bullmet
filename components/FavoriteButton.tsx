'use client';

import { useEffect, useState } from 'react';
import { getCurrentSession, type BullmetSession } from '@/lib/auth';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import type { Product } from './shopData';

export function FavoriteButton({ product, variant = 'icon' }: { product: Product; variant?: 'icon' | 'text' }) {
  const [active, setActive] = useState(false);
  const [session, setSession] = useState<BullmetSession | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const current = await getCurrentSession();
      const value = await isFavorite(product.slug, current);
      if (!mounted) return;
      setSession(current);
      setActive(value);
    }
    load();
    const onUpdate = () => load();
    window.addEventListener('bullmet-favorites-updated', onUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('bullmet-favorites-updated', onUpdate);
    };
  }, [product.slug]);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    const next = await toggleFavorite(product, session);
    setActive(next);
    setBusy(false);
  }

  if (variant === 'text') {
    return (
      <button className={`favoriteTextButton ${active ? 'active' : ''}`} type="button" onClick={onClick} aria-pressed={active}>
        <HeartIcon filled={active} />
        {active ? 'В избранном' : 'В избранное'}
      </button>
    );
  }

  return (
    <button className={`favoriteButton ${active ? 'active' : ''}`} type="button" onClick={onClick} aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'} aria-pressed={active}>
      <HeartIcon filled={active} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path d="M20.3 5.7a5.2 5.2 0 0 0-7.4 0l-.9.9-.9-.9a5.2 5.2 0 1 0-7.4 7.4l.9.9L12 21.2l7.4-7.2.9-.9a5.2 5.2 0 0 0 0-7.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
