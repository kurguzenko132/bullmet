'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
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
  const railRef = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    const firstCard = rail.querySelector<HTMLElement>('.catalog-card-market');
    const gap = Number.parseFloat(window.getComputedStyle(rail).gap) || 0;
    rail.scrollBy({ left: direction * ((firstCard?.offsetWidth || 280) + gap), behavior: 'smooth' });
  }

  return (
    <div className="home-products-carousel">
      <div className="home-products-controls" aria-label="Прокрутка популярных моделей">
        <button type="button" onClick={() => scroll(-1)} aria-label="Предыдущие модели"><ArrowLeft aria-hidden="true" /></button>
        <button type="button" onClick={() => scroll(1)} aria-label="Следующие модели"><ArrowRight aria-hidden="true" /></button>
      </div>
      <div className="catalog-grid-market" ref={railRef}>
        {products.map((product) => <ProductCard key={product.slug} product={product} reviewSettings={reviewSettings} rating={product.rating || 0} reviewsCount={product.reviewsCount || 0} onAddToCart={addToCart} />)}
      </div>
    </div>
  );
}
