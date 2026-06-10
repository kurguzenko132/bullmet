'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import type { CatalogProduct } from '@/lib/products';
import { getImagePreset } from '@/lib/imageDisplay';
import { supabase } from '@/lib/supabase';

type ProductReview = {
  id: string;
  user_name?: string | null;
  user_email?: string | null;
  rating: number;
  comment: string;
  photo_urls?: string[] | null;
  created_at?: string | null;
  status?: string | null;
};

function money(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function discountPercent(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function normalizeImages(product: CatalogProduct) {
  const seen = new Set<string>();
  return [product.image, ...(product.images || [])]
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
}

export function ProductDetailsClient({ product, related, colorVariants }: { product: CatalogProduct; related: CatalogProduct[]; colorVariants: CatalogProduct[] }) {
  const images = useMemo(() => normalizeImages(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSize, setActiveSize] = useState(product.sizes?.[0] || 'Под заказ');
  const [qty, setQty] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const activeImage = images[activeIndex] || product.image;
  const activeImageSettings = getImagePreset(product, activeImage, 'product');
  const activeModalSettings = getImagePreset(product, activeImage, 'modal');
  const discount = discountPercent(product.price, product.oldPrice);
  const averageRating = reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length : 0;
  const sortedColorVariants = useMemo(() => {
    return [...colorVariants].sort((a, b) => {
      if (a.slug === product.slug) return -1;
      if (b.slug === product.slug) return 1;
      return (a.colorName || a.title).localeCompare(b.colorName || b.title, 'ru');
    });
  }, [colorVariants, product.slug]);

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
    let mounted = true;
    async function loadReviews() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('product_reviews')
        .select('id, user_name, user_email, rating, comment, photo_urls, created_at, status')
        .eq('product_slug', product.slug)
        .in('status', ['published'])
        .order('created_at', { ascending: false });
      if (!error && mounted) setReviews((data || []) as ProductReview[]);
    }
    loadReviews();
    return () => { mounted = false; };
  }, [product.slug]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') prevImage();
      if (event.key === 'ArrowRight') nextImage();
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
    if (Math.abs(diff) > 40) diff > 0 ? nextImage() : prevImage();
    setTouchStartX(null);
  }

  function handleAddToCart() {
    const cartItem = {
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: activeImage || product.image,
      material: product.material,
      size: activeSize,
      quantity: qty
    };

    try {
      const raw = window.localStorage.getItem('bullmet_cart');
      const current = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(current) ? current : [];
      const existingIndex = list.findIndex((item) => item?.slug === product.slug && item?.size === activeSize);
      if (existingIndex >= 0) list[existingIndex].quantity = Number(list[existingIndex].quantity || 0) + qty;
      else list.push(cartItem);
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

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewMessage('');
    if (!supabase) {
      setReviewMessage('Supabase не подключен. Отзыв пока нельзя отправить.');
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      setReviewMessage('Чтобы оставить отзыв, войдите в аккаунт.');
      return;
    }
    const { error } = await supabase.from('product_reviews').upsert({
      product_slug: product.slug,
      user_id: session.user.id,
      user_email: session.user.email,
      user_name: session.user.email?.split('@')[0] || 'Покупатель',
      rating: reviewRating,
      comment: reviewComment.trim(),
      photo_urls: [],
      status: 'pending'
    }, { onConflict: 'product_slug,user_id' });
    if (error) setReviewMessage(error.message);
    else {
      setReviewMessage('Отзыв отправлен на модерацию. После проверки он появится на сайте.');
      setReviewComment('');
      setReviewRating(5);
    }
  }

  return (
    <>
      <section className="product-page-shell">
        <div className="product-breadcrumbs">
          <Link href="/">Главная</Link><span>›</span><Link href="/catalog">Каталог</Link>
          {product.category && <><span>›</span><span>{product.category}</span></>}
          <span>›</span><span>{product.title}</span>
        </div>

        <div className="product-detail-layout">
          <div className="product-gallery-panel">
            <div className="product-thumbs" aria-label="Фотографии товара">
              {images.map((image, index) => (
                <button key={`${image}-${index}`} className={activeIndex === index ? 'is-active' : ''} type="button" onClick={() => setActiveIndex(index)} aria-label={`Показать фото ${index + 1}`}>
                  <img src={image} alt="" style={getImagePreset(product, image, 'thumb').style} />
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
              <img src={activeImage} alt={product.title} style={activeImageSettings.style} />
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
              {reviews.length > 0 && <em>★ {averageRating.toFixed(1)} / {reviews.length} отзыв.</em>}
            </div>

            <div className="product-price-row">
              <strong>от {money(product.price)} BYN</strong>
              {product.oldPrice && <del>{money(product.oldPrice)} BYN</del>}
              {discount && <span>-{discount}%</span>}
            </div>

            <p className="product-description-full">{product.description}</p>

            {sortedColorVariants.length > 1 && (
              <div className="product-choice-block">
                <div className="choice-headline">
                  <p>Цвет / вариант</p>
                  <span>Выберите нужное исполнение по фото</span>
                </div>
                <div className="color-variants color-variants--photos">
                  {sortedColorVariants.map((variant) => {
                    const previewImages = normalizeImages(variant);
                    const preview = previewImages[0] || variant.image;
                    const previewSettings = getImagePreset(variant, preview, 'variant');
                    const label = variant.colorName || variant.title;
                    const isActive = variant.slug === product.slug;

                    return (
                      <Link key={variant.slug} href={`/product/${variant.slug}`} className={isActive ? 'is-active' : ''} title={label} aria-label={`Открыть вариант: ${label}`}>
                        <span className="variant-photo">
                          <img
                            src={preview}
                            alt={label}
                            style={previewSettings.style}
                          />
                        </span>
                        <span className="variant-text">
                          <b>{label}</b>
                          {isActive ? <small>Сейчас выбран</small> : <small>Смотреть вариант</small>}
                        </span>
                      </Link>
                    );
                  })}
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
              {product.specs.slice(0, 5).map((spec, index) => <li key={`${spec}-${index}`}><span>✓</span>{spec}</li>)}
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

      <section className="product-content-section">
        <article className="product-content-card product-content-card--wide">
          <p className="product-section-eyebrow">О товаре</p>
          <h2>{product.title}</h2>
          <p>{product.description}</p>
          <p>Изготовление выполняется на собственном производстве Bullmet. Размер, цвет, материал и оформление можно адаптировать под ваш проект.</p>
        </article>

        <article className="product-content-card">
          <p className="product-section-eyebrow">Характеристики</p>
          <h2>Основные параметры</h2>
          <div className="product-spec-table product-spec-table--simple">
            {product.specs.map((spec, index) => <div key={`${spec}-${index}`}><b>Параметр {index + 1}</b><span>{spec}</span></div>)}
            <div><b>Категория</b><span>{product.category || 'Каталог'}</span></div>
            <div><b>Материал</b><span>{product.material}</span></div>
            <div><b>Размеры</b><span>{product.sizes.join(', ') || 'Под заказ'}</span></div>
          </div>
        </article>

        <article className="product-content-card">
          <p className="product-section-eyebrow">Доставка и оплата</p>
          <h2>Как получить заказ</h2>
          <div className="delivery-list-simple">
            <div><b>1. Уточняем детали</b><span>Согласовываем размер, материал, цвет, комплектацию и сроки.</span></div>
            <div><b>2. Изготавливаем</b><span>Запускаем изделие в работу на собственном производстве.</span></div>
            <div><b>3. Передаем заказ</b><span>Самовывоз или доставка по Беларуси в удобное время.</span></div>
          </div>
        </article>

        <article className="product-content-card product-content-card--wide">
          <div className="product-reviews-head">
            <div>
              <p className="product-section-eyebrow">Отзывы</p>
              <h2>Отзывы покупателей</h2>
            </div>
            {reviews.length > 0 && <span>★ {averageRating.toFixed(1)} / {reviews.length}</span>}
          </div>
          <div className="product-reviews-grid product-reviews-grid--simple">
            <div className="reviews-list">
              {reviews.length ? reviews.map((review) => (
                <article key={review.id} className="review-card">
                  <div><b>{review.user_name || review.user_email || 'Покупатель'}</b><span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></div>
                  <p>{review.comment}</p>
                  {!!review.photo_urls?.length && <div className="review-photos">{review.photo_urls.map((url) => <img key={url} src={url} alt="Фото отзыва" />)}</div>}
                </article>
              )) : <p className="empty-reviews">Пока отзывов нет. Первый отзыв можно оставить после входа в аккаунт.</p>}
            </div>
            <form className="review-form review-form--simple" onSubmit={submitReview}>
              <h3>Оставить отзыв</h3>
              <label>Оценка<select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}</select></label>
              <label>Комментарий<textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} rows={4} placeholder="Расскажите о товаре" required /></label>
              {reviewMessage && <p>{reviewMessage}</p>}
              <button type="submit">Отправить на модерацию</button>
            </form>
          </div>
        </article>
      </section>

      {related.length > 0 && (
        <section className="related-products-section">
          <div className="related-head"><h2>Похожие товары</h2><Link href="/catalog">В каталог</Link></div>
          <div className="related-grid">
            {related.map((item) => (
              <article className="related-card" key={item.slug}>
                <Link href={`/product/${item.slug}`} className="related-image"><img src={item.image} alt={item.title} style={getImagePreset(item, item.image, 'related').style} /></Link>
                <div><Link href={`/product/${item.slug}`}>{item.title}</Link><p>{item.short || item.material}</p><b>от {money(item.price)} BYN</b></div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="mobile-buy-bar" aria-label="Быстрая покупка">
        <div>
          <span>Цена</span>
          <b>от {money(product.price)} BYN</b>
        </div>
        <button type="button" onClick={handleAddToCart}>В корзину</button>
        <button type="button" onClick={() => setQuickOrderOpen(true)}>1 клик</button>
      </div>

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
            <img src={activeImage} alt={product.title} style={activeModalSettings.style} />
          </div>
          {images.length > 1 && <button className="lightbox-arrow lightbox-arrow--next" type="button" onClick={nextImage} aria-label="Следующее фото">›</button>}
          {images.length > 1 && (
            <div className="lightbox-thumbs">
              {images.map((image, index) => (
                <button key={`${image}-lightbox-${index}`} className={activeIndex === index ? 'is-active' : ''} type="button" onClick={() => setActiveIndex(index)}>
                  <img src={image} alt="" style={getImagePreset(product, image, 'thumb').style} />
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
  return <div><Icon name={icon} /><b>{title}</b><span>{text}</span></div>;
}
