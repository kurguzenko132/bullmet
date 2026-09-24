'use client';

import { KeyboardEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from './Icon';
import { productAvailability, type CatalogProduct } from '@/lib/products';
import { getImagePreset } from '@/lib/imageDisplay';
import type { ReviewControlSettings } from '@/lib/reviewControl';

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function discountPercent(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function reviewWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'отзыв';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'отзыва';
  return 'отзывов';
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
  const router = useRouter();

  function open(slug: string) {
    router.push(`/product/${slug}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>, slug: string) {
    if (event.target !== event.currentTarget) return;
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
    <div className="catalog-grid-market home-popular-catalog-grid">
      {products.map((product) => {
        const imageSettings = getImagePreset(product, product.image, 'catalog');
        const discount = discountPercent(product.price, product.oldPrice);
        const availability = productAvailability(product);
        const reviewsCount = product.reviewsCount || 0;
        const rating = product.rating || 0;
        const reviewsLabel = reviewsCount ? `${reviewsCount} ${reviewWord(reviewsCount)}` : 'Нет отзывов';

        return (
          <article
            className="catalog-card-market"
            key={product.slug}
            role="link"
            tabIndex={0}
            onClick={() => open(product.slug)}
            onKeyDown={(event) => onKeyDown(event, product.slug)}
            aria-label={`Открыть товар: ${product.title}`}
          >
            <div className="catalog-card-image-market">
              <img src={product.image} alt={product.title} style={imageSettings.style} />
              {discount && <span className="catalog-sale-market">-{discount}%</span>}
            </div>

            <div className="catalog-card-body-market">
              <div className="catalog-card-rating-market">
                {reviewsCount ? <>{reviewSettings.productRating && <span>★ {rating.toFixed(1)}</span>}{reviewSettings.productCount && <small>{reviewSettings.productRating ? '· ' : ''}{reviewsLabel}</small>}</> : reviewSettings.productCount && <small>{reviewsLabel}</small>}
              </div>

              <h3>{product.title}</h3>
              <p>{product.material || product.short}</p>
              <small>{availability === 'in_stock' ? 'В наличии' : availability === 'made_to_order' ? 'Под заказ · 5–7 дней' : 'Недоступен к покупке'}</small>
              <p className="catalog-card-color-market">Цвет: <span>{product.colorName || 'не указан'}</span></p>

              <div className="catalog-card-bottom-market">
                <div>
                  <b>от {money(product.price)} BYN</b>
                  {product.oldPrice && product.oldPrice > product.price && <del>{money(product.oldPrice)} BYN</del>}
                </div>
                <button type="button" disabled={availability === 'unavailable'} aria-label={availability === 'unavailable' ? `${product.title} недоступен` : `Добавить в корзину: ${product.title}`} onClick={(event) => onCartClick(event, product)}><Icon name="cart" /></button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
