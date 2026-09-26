'use client';

import { ProductCard } from './ProductCard';
import { productAvailability, type CatalogProduct } from '@/lib/products';
import type { ReviewControlSettings } from '@/lib/reviewControl';

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function addToCart(product: CatalogProduct) {
  if (productAvailability(product) === 'unavailable') return;
  try {
    const raw = window.localStorage.getItem('bullmet_cart');
    const cart = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(cart) ? cart : [];
    const size = product.sizes?.[0] || 'Под заказ';
    const index = list.findIndex((item) => item.slug === product.slug && item.size === size);
    const item = { productId: product.id, slug: product.slug, title: product.title, price: product.price, oldPrice: product.oldPrice, image: product.image, material: product.material, size, availability: productAvailability(product), quantity: 1 };
    const next = index >= 0
      ? list.map((cartItem, i) => i === index ? { ...cartItem, quantity: Number(cartItem.quantity || 1) + 1 } : cartItem)
      : [...list, item];
    window.localStorage.setItem('bullmet_cart', JSON.stringify(next));
    window.dispatchEvent(new Event('bullmet-cart-updated'));
  } catch {}
}

export function HomeProductsClient({ products, reviewSettings }: { products: CatalogProduct[]; reviewSettings: Pick<ReviewControlSettings, 'productRating' | 'productCount'> }) {
  return (
    <div className="catalog-grid-market">
      {products.map((product) => <ProductCard key={product.slug} product={product} reviewSettings={reviewSettings} rating={product.rating || 0} reviewsCount={product.reviewsCount || 0} onAddToCart={addToCart} />)}
    </div>
  );
}
