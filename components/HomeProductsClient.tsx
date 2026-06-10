'use client';

import { KeyboardEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from './Icon';
import type { CatalogProduct } from '@/lib/products';
import { getImagePreset } from '@/lib/imageDisplay';

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function discountPercent(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function addToCart(product: CatalogProduct) {
  try {
    const raw = window.localStorage.getItem('bullmet_cart');
    const cart = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(cart) ? cart : [];
    const size = product.sizes?.[0] || 'Под заказ';
    const index = list.findIndex((item) => item.slug === product.slug && item.size === size);
    const item = { slug: product.slug, title: product.title, price: product.price, image: product.image, material: product.material, size, quantity: 1 };
    const next = index >= 0
      ? list.map((cartItem, i) => i === index ? { ...cartItem, quantity: Number(cartItem.quantity || 1) + 1 } : cartItem)
      : [...list, item];
    window.localStorage.setItem('bullmet_cart', JSON.stringify(next));
    window.dispatchEvent(new Event('bullmet-cart-updated'));
  } catch {}
}

export function HomeProductsClient({ products }: { products: CatalogProduct[] }) {
  const router = useRouter();

  function open(slug: string) {
    router.push(`/product/${slug}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>, slug: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open(slug);
    }
  }

  function onCartClick(event: MouseEvent<HTMLButtonElement>, product: CatalogProduct) {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product);
  }

  return (
    <div className="home-product-grid-shop">
      {products.map((product) => {
        const imageSettings = getImagePreset(product, product.image, 'home');
        const discount = discountPercent(product.price, product.oldPrice);
        return (
          <article className="home-product-card-shop" key={product.slug} role="link" tabIndex={0} onClick={() => open(product.slug)} onKeyDown={(event) => onKeyDown(event, product.slug)}>
            <div className="home-product-image-shop">
              <img src={product.image} alt={product.title} style={imageSettings.style} />
              {discount && <span>-{discount}%</span>}
            </div>
            <div className="home-product-body-shop">
              <h4>{product.title}</h4>
              <p>{product.short || product.material}</p>
              <div className="home-product-tags-shop">
                <span>{product.category || 'Каталог'}</span>
                <span>{product.inStock ? 'В наличии' : 'Под заказ'}</span>
              </div>
              <div className="home-product-bottom-shop">
                <b>от {money(product.price)} BYN</b>
                <button type="button" aria-label={`Добавить в корзину: ${product.title}`} onClick={(event) => onCartClick(event, product)}><Icon name="cart" /></button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
