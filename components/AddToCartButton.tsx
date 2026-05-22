'use client';

import { useState, type MouseEvent, type ReactNode } from 'react';
import { CartIcon } from './Icons';
import type { Product } from './shopData';
import { addToCart, makeCartItem } from './cart';

type AddToCartButtonProps = {
  product: Product;
  quantity?: number;
  size?: string;
  className?: string;
  children?: ReactNode;
  iconOnly?: boolean;
};

export function AddToCartButton({ product, quantity = 1, size, className, children, iconOnly }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAdd(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    addToCart(makeCartItem(product, quantity, size));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  }

  return (
    <button className={className} type="button" aria-label={`Добавить ${product.title} в корзину`} onClick={handleAdd}>
      {iconOnly ? <CartIcon /> : added ? 'Добавлено' : children ?? 'В корзину'}
    </button>
  );
}
