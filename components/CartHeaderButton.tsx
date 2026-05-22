'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CartIcon } from './Icons';
import { cartCount, readCart } from './cart';

export function CartHeaderButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(cartCount(readCart()));
    update();
    window.addEventListener('storage', update);
    window.addEventListener('bullmet-cart-updated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('bullmet-cart-updated', update);
    };
  }, []);

  return (
    <Link className="cartButton" href="/cart" aria-label="Корзина">
      <CartIcon />
      {count > 0 && <em>{count}</em>}
    </Link>
  );
}
