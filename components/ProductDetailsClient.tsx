'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import type { CatalogProduct } from '@/lib/products';
import { getImageSettings } from '@/lib/imageDisplay';

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function discountPercent(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function ProductDetailsClient({ product, related, colorVariants }: { product: CatalogProduct; related: CatalogProduct[]; colorVariants: CatalogProduct[] }) {
  const images = useMemo(() => product.images?.length ? product.images : [product.image], [product.images, product.image]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSize, setActiveSize] = useState(product.sizes?.[0] || 'Под заказ');
  const [qty, setQty] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const activeImage = images[activeIndex] || product.image;
  const settings = getImageSettings(product, activeImage);
  const discount = discountPercent(product.price, product.oldPrice);

  useEffect(() => {
    setActiveIndex(0);
    setActiveSize(product.sizes?.[0] || 'Под заказ');
    setQty(1);
    setCartMessage('');
  }, [product.slug, product.sizes]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('bullmet_favorites');
      const favorites = raw ? JSON.parse(raw) : [];
      setFavorite(Array.isArray(favorites) && favorites.some((item) => item?.slug === product.slug));
    } catch {
      setFavorite(false);
    }
  }, [product.slug]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') setActiveIndex((value) => (value - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') setActiveIndex((value) => (value + 1) % images.length);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen, images.length]);

  function prevImage() {
    setActiveIndex((value) => (value - 1 + images.length) % images.length);
  }

  function nextImage() {
    setActiveIndex((value) => (value + 1) % images.length);
  }

  function onTouchEnd(clientX: number) {
    if (touchStartX === null) return;
    const diff = touchStartX - clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextImage();
      else prevImage();
    }
    setTouchStartX(null);
  }

  function handleAddToCart() {
    const cartItem = {
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.image,
      material: product.material,
      size: activeSize,
      quantity: qty
    };

    try {
      const raw = window.localStorage.getItem('bullmet_cart');
      const current = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(current) ? current : [];
      const existingIndex = list.findIndex((item) => item?.slug === product.slug && item?.size === activeSize);
      if (existingIndex >= 0) {
        list[existingIndex].quantity = Number(list[existingIndex].quantity || 0) + qty;
      } else {
        list.push(cartItem);
      }
      window.localStorage.setItem('bullmet_cart', JSON.stringify(list));
      setCartMessage('Товар добавлен в корзину');
      window.dispatchEvent(new Event('bullmet-cart-updated'));
    } catch {
      setCartMessage('Не удалось добавить товар. Попробуйте еще раз.');
    }
  }

  function toggleFavorite() {
    try {
      const raw = window.localStorage.getItem('bullmet_favorites');
      const current = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(current) ? current : [];
      const exists = list.some((item) => item?.slug === product.slug);
      const next = exists
        ? list.filter((item) => item?.slug !== product.slug)
        : [...list, { slug: product.slug, title: product.title, price: product.price, image: product.image, short: product.short, category: product.category }];
      window.localStorage.setItem('bullmet_favorites', JSON.stringify(next));
      setFavorite(!exists);
    } catch {}
  }

  return (
    <>
      <section className="product-page-shell">
        <div className="product-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>›</span>
          <Link href="/catalog">Каталог</Link>
          {product.category && <><span>›</span><span>{product.category}</span></>}
          <span>›</span>
          <span>{product.title}</span>
        </div>

        <div className="product-detail-layout">
          <div className="product-gallery-panel">
            <div className="product-thumbs" aria-label="Фотографии товара">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  className={activeIndex === index ? 'is-active' : ''}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Показать фото ${index + 1}`}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>

            <div
              className="product-main-photo"
              onClick={() => setLightboxOpen(true)}
              onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
              onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
              role="button"
              tabIndex={0}
              aria-label="Открыть фото товара"
            >
              <img
                src={activeImage}
                alt={product.title}
                style={{ objectFit: settings.productFit, objectPosition: settings.productPosition }}
              />
              {images.length > 1 && (
                <>
                  <button className="gallery-nav gallery-nav--prev" type="button" onClick={(event) => { event.stopPropagation(); prevImage(); }} aria-label="Предыдущее фото">‹</button>
                  <button className="gallery-nav gallery-nav--next" type="button" onClick={(event) => { event.stopPropagation(); nextImage(); }} aria-label="Следующее фото">›</button>
                  <div className="gallery-dots" aria-hidden="true">
                    {images.map((_, index) => <span key={index} className={activeIndex === index ? 'is-active' : ''} />)}
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className="product-info-panel">
            <div className="product-heading-row">
              <div>
                <p className="product-category-label">{product.category || 'Товар Bullmet'}</p>
                <h1>{product.title}</h1>
              </div>
              <button className={favorite ? 'favorite-circle is-active' : 'favorite-circle'} type="button" onClick={toggleFavorite} aria-label="Добавить в избранное">{favorite ? '♥' : '♡'}</button>
            </div>

            <div className="product-stock-row">
              <span className={product.inStock ? 'stock-dot stock-dot--ok' : 'stock-dot'} />
              <b>{product.inStock ? 'В наличии / под заказ' : 'Под заказ'}</b>
              {product.isNew && <em>Новинка</em>}
              {product.isPopular && <em>Популярное</em>}
            </div>

            <div className="product-price-row">
              <strong>от {money(product.price)} BYN</strong>
              {product.oldPrice && <del>{money(product.oldPrice)} BYN</del>}
              {discount && <span>-{discount}%</span>}
            </div>

            <p className="product-description-full">{product.description}</p>

            {colorVariants.length > 1 && (
              <div className="product-choice-block">
                <p>Цвет / вариант</p>
                <div className="color-variants">
                  {colorVariants.map((variant) => (
                    <Link key={variant.slug} href={`/product/${variant.slug}`} className={variant.slug === product.slug ? 'is-active' : ''} title={variant.colorName || variant.title}>
                      <i style={{ background: variant.colorHex || '#222' }} />
                      <span>{variant.colorName || variant.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="product-choice-block">
              <p>Размер / диаметр</p>
              <div className="size-options">
                {(product.sizes?.length ? product.sizes : ['Под заказ']).map((size) => (
                  <button key={size} className={activeSize === size ? 'is-active' : ''} type="button" onClick={() => setActiveSize(size)}>{size}</button>
                ))}
              </div>
            </div>

            <div className="product-choice-block product-choice-grid">
              <div>
                <p>Количество</p>
                <div className="qty-control">
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty(qty + 1)}>+</button>
                </div>
              </div>
              <div>
                <p>Материал</p>
                <b className="material-pill">{product.material}</b>
              </div>
            </div>

            <div className="product-actions-row">
              <button className="button-main" type="button" onClick={handleAddToCart}>В корзину</button>
              <button className="button-secondary" type="button" onClick={() => setQuickOrderOpen(true)}>Купить в 1 клик</button>
              <Link className="button-outline-wide" href={`/contacts?product=${product.slug}`}>Заказать похожее</Link>
            </div>

            {cartMessage && <div className="product-cart-message">{cartMessage}</div>}

            <ul className="product-specs-list">
              {product.specs.map((spec, index) => (
                <li key={`${spec}-${index}`}><span>✓</span>{spec}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="product-service-strip-fixed">
        <ServiceItem icon="factory" title="Собственное производство" text="Изготавливаем изделия сами и контролируем каждый этап" />
        <ServiceItem icon="tools" title="Индивидуальные размеры" text="Подстроим изделие под ваш проект, интерьер или участок" />
        <ServiceItem icon="shield" title="Гарантия качества" text="Проверяем металл, покрытие, крепления и сборку" />
        <ServiceItem icon="truck" title="Доставка по Беларуси" text="Самовывоз или доставка в удобное для вас время" />
      </section>

      {related.length > 0 && (
        <section className="related-products-section">
          <div className="related-head">
            <h2>Похожие товары</h2>
            <Link href="/catalog">В каталог</Link>
          </div>
          <div className="related-grid">
            {related.map((item) => (
              <article className="related-card" key={item.slug}>
                <Link href={`/product/${item.slug}`} className="related-image">
                  <img src={item.image} alt={item.title} />
                </Link>
                <div>
                  <Link href={`/product/${item.slug}`}>{item.title}</Link>
                  <p>{item.short || item.material}</p>
                  <b>от {money(item.price)} BYN</b>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {quickOrderOpen && (
        <div className="quick-order-modal" role="dialog" aria-modal="true">
          <div className="quick-order-card">
            <button className="quick-order-close" type="button" onClick={() => setQuickOrderOpen(false)} aria-label="Закрыть">×</button>
            <h2>Купить в 1 клик</h2>
            <p>{product.title}, {activeSize}, количество: {qty}</p>
            <form onSubmit={(event) => { event.preventDefault(); setCartMessage('Заявка отправлена. Мы свяжемся с вами.'); setQuickOrderOpen(false); }}>
              <input name="name" placeholder="Ваше имя" />
              <input name="phone" placeholder="Телефон" required />
              <textarea name="comment" placeholder="Комментарий к заказу" rows={4} />
              <button type="submit">Отправить заявку</button>
            </form>
          </div>
        </div>
      )}

      {lightboxOpen && (
        <div className="product-lightbox" role="dialog" aria-modal="true">
          <button className="lightbox-close" type="button" onClick={() => setLightboxOpen(false)} aria-label="Закрыть">×</button>
          {images.length > 1 && <button className="lightbox-arrow lightbox-arrow--prev" type="button" onClick={prevImage} aria-label="Предыдущее фото">‹</button>}
          <div className="lightbox-stage" onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)} onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}>
            <img src={activeImage} alt={product.title} />
          </div>
          {images.length > 1 && <button className="lightbox-arrow lightbox-arrow--next" type="button" onClick={nextImage} aria-label="Следующее фото">›</button>}
          {images.length > 1 && (
            <div className="lightbox-thumbs">
              {images.map((image, index) => (
                <button key={`${image}-lightbox-${index}`} className={activeIndex === index ? 'is-active' : ''} type="button" onClick={() => setActiveIndex(index)}>
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ServiceItem({ icon, title, text }: { icon: 'factory' | 'tools' | 'shield' | 'truck'; title: string; text: string }) {
  return (
    <div>
      <Icon name={icon} />
      <b>{title}</b>
      <span>{text}</span>
    </div>
  );
}
