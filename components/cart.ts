import type { Product } from './shopData';

export type CartItem = {
  slug: string;
  title: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
};

export const CART_STORAGE_KEY = 'bullmet-cart';

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('bullmet-cart-updated'));
}

export function makeCartItem(product: Product, quantity = 1, size?: string): CartItem {
  return {
    slug: product.slug,
    title: product.title,
    price: product.price,
    image: product.image,
    size,
    quantity,
  };
}

export function addToCart(item: CartItem) {
  const cart = readCart();
  const index = cart.findIndex((entry) => entry.slug === item.slug && entry.size === item.size);

  if (index >= 0) {
    cart[index] = { ...cart[index], quantity: cart[index].quantity + item.quantity };
  } else {
    cart.push(item);
  }

  writeCart(cart);
  return cart;
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
