'use client';

import { useEffect, useState } from 'react';
import { type AdminProduct, readAdminProductsAsync } from './adminProductStore';

export function useAdminProducts() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const sync = async () => {
      try {
        setError('');
        const next = await readAdminProductsAsync();
        if (!active) return;
        setItems(next);
      } catch (err) {
        if (!active) return;
        console.error('Products loading failed:', err);
        setError(err instanceof Error ? err.message : 'Не удалось загрузить товары');
        setItems([]);
      } finally {
        if (active) setReady(true);
      }
    };
    sync();
    window.addEventListener('bullmet-products-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      active = false;
      window.removeEventListener('bullmet-products-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return { items, ready, error };
}
