'use client';

import { KeyboardEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from './Icon';
import { getImagePreset } from '@/lib/imageDisplay';
import { productAvailability, type CatalogProduct } from '@/lib/products';
import type { ReviewControlSettings } from '@/lib/reviewControl';

type ProductCardProps = {
  product: CatalogProduct;
  reviewSettings: Pick<ReviewControlSettings, 'productRating' | 'productCount'>;
  rating?: number;
  reviewsCount?: number;
  onAddToCart?: (product: CatalogProduct) => void;
  className?: string;
};

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function reviewWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'отзыв';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'отзыва';
  return 'отзывов';
}

export function ProductCard({ product, reviewSettings, rating = 0, reviewsCount = 0, onAddToCart, className = '' }: ProductCardProps) {
  const router = useRouter();
  const imageSettings = getImagePreset(product, product.image, 'catalog');
  const availability = productAvailability(product);
  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;
  const reviewsLabel = reviewsCount ? `${reviewsCount} ${reviewWord(reviewsCount)}` : 'Нет отзывов';

  function openProduct() {
    router.push(`/product/${product.slug}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProduct();
    }
  }

  function addToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onAddToCart?.(product);
  }

  return (
    <article className={`catalog-card-market ${className}`.trim()} role="link" tabIndex={0} onClick={openProduct} onKeyDown={onKeyDown} aria-label={`Открыть товар: ${product.title}`}>
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
          <button type="button" disabled={availability === 'unavailable'} aria-label={availability === 'unavailable' ? `${product.title} недоступен` : `Добавить в корзину: ${product.title}`} onClick={addToCart}><Icon name="cart" /></button>
        </div>
      </div>
    </article>
  );
}
