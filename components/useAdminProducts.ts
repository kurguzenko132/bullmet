'use client';

import { useEffect, useState } from 'react';
import { type AdminProduct, readAdminProductsAsync } from './adminProductStore';

export function useAdminProducts() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      const next = await readAdminProductsAsync();
      if (!active) return;
      setItems(next);
      setReady(true);
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

  return { items, ready };
}
