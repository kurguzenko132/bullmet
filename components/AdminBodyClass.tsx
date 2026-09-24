'use client';

import { useEffect } from 'react';

/** Marks the document while an admin route is mounted, isolating storefront overrides. */
export function AdminBodyClass() {
  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => document.body.classList.remove('admin-body');
  }, []);

  return null;
}
