'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
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

function reviewWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'отзыв';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'отзыва';
  return 'отзывов';
}

function RatingStars({ value, onChange, readOnly = false, size = 'normal' }: { value: number; onChange?: (value: number) => void; readOnly?: boolean; size?: 'normal' | 'small' }) {
  return (
    <div className={`rating-stars rating-stars--${size} ${readOnly ? 'is-readonly' : ''}`} aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? 'is-active' : ''}
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          aria-label={`Поставить ${star}`}
        >
          ★
        </button>
      ))}
    </div>
  );
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
  const [quickOrderName, setQuickOrderName] = useState('');
  const [quickOrderPhone, setQuickOrderPhone] = useState('');
  const [quickOrderComment, setQuickOrderComment] = useState('');
  const [quickOrderLoading, setQuickOrderLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewPhotoLightbox, setReviewPhotoLightbox] = useState<string | null>(null);
  const activeImage = images[activeIndex] || product.image;
  const activeImageSettings = getImagePreset(product, activeImage, 'product');
  const activeModalSettings = getImagePreset(product, activeImage, 'modal');
  const discount = discountPercent(product.price, product.oldPrice);
  const averageRating = reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length : 0;
  const roundedRating = reviews.length ? Math.round(averageRating) : 0;
  const reviewsLabel = reviews.length ? `${reviews.length} ${reviewWord(reviews.length)}` : 'нет отзывов';
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

  function pushToCart(cartItem: { slug: string; title: string; price: number; image: string; material?: string; size?: string; quantity: number }) {
    try {
      const raw = window.localStorage.getItem('bullmet_cart');
      const current = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(current) ? current : [];
      const existingIndex = list.findIndex((item) => item?.slug === cartItem.slug && item?.size === cartItem.size);
      if (existingIndex >= 0) list[existingIndex].quantity = Number(list[existingIndex].quantity || 0) + cartItem.quantity;
      else list.push(cartItem);
      window.localStorage.setItem('bullmet_cart', JSON.stringify(list));
      setCartMessage('Товар добавлен в корзину');
      window.dispatchEvent(new Event('bullmet-cart-updated'));
    } catch {
      setCartMessage('Не удалось добавить товар. Попробуйте еще раз.');
    }
  }

  function handleAddToCart() {
    pushToCart({
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: activeImage || product.image,
      material: product.material,
      size: activeSize,
      quantity: qty
    });
  }

  function handleAddRelatedToCart(item: CatalogProduct) {
    const relatedImages = normalizeImages(item);
    pushToCart({
      slug: item.slug,
      title: item.title,
      price: item.price,
      image: relatedImages[0] || item.image,
      material: item.material,
      size: item.sizes?.[0] || 'Под заказ',
      quantity: 1
    });
  }

  async function submitQuickOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCartMessage('');
    if (!quickOrderName.trim() || !quickOrderPhone.trim()) {
      setCartMessage('Укажите имя и телефон для заявки.');
      return;
    }

    setQuickOrderLoading(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'quick_order',
          name: quickOrderName,
          phone: quickOrderPhone,
          comment: quickOrderComment,
          productSlug: product.slug,
          productTitle: product.title,
          productImage: activeImage || product.image,
          productPrice: product.price,
          productMaterial: product.material,
          size: activeSize,
          quantity: qty,
          type: 'Купить в 1 клик'
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось отправить заявку.');
      setCartMessage(`Заявка отправлена${data.id ? `: ${data.id}` : ''}. Мы свяжемся с вами.`);
      setQuickOrderOpen(false);
      setQuickOrderName('');
      setQuickOrderPhone('');
      setQuickOrderComment('');
    } catch (error) {
      setCartMessage(error instanceof Error ? error.message : 'Не удалось отправить заявку.');
    } finally {
      setQuickOrderLoading(false);
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


  function chooseReviewPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 5);

    setReviewPhotos(files);
  }

  async function uploadReviewPhotos(userId: string) {
    if (!supabase || !reviewPhotos.length) return [] as string[];

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images';
    const uploaded: string[] = [];

    for (const file of reviewPhotos) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const path = `reviews/${product.slug}/${userId}/${safeName}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: false,
        contentType: file.type || 'image/jpeg'
      });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (data.publicUrl) uploaded.push(data.publicUrl);
    }

    return uploaded;
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

    if (!reviewComment.trim()) {
      setReviewMessage('Напишите короткий комментарий к отзыву.');
      return;
    }

    setReviewSubmitting(true);

    try {
      const uploadedPhotoUrls = await uploadReviewPhotos(session.user.id);

      const { data, error } = await supabase.from('product_reviews').insert({
        product_slug: product.slug,
        user_id: session.user.id,
        user_email: session.user.email,
        user_name: session.user.email?.split('@')[0] || 'Покупатель',
        rating: reviewRating,
        comment: reviewComment.trim(),
        photo_urls: uploadedPhotoUrls,
        status: 'published'
      }).select('id, user_name, user_email, rating, comment, photo_urls, created_at, status').single();

      if (error) throw error;

      setReviews((current) => {
        const nextReview = data as ProductReview;
        return [nextReview, ...current.filter((item) => item.id !== nextReview.id)];
      });

      setReviewMessage('Отзыв опубликован. Он уже отображается на странице товара.');
      setReviewComment('');
      setReviewRating(5);
      setReviewPhotos([]);
    } catch (error) {
      setReviewMessage(error instanceof Error ? error.message : 'Не удалось отправить отзыв.');
    } finally {
      setReviewSubmitting(false);
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
              {reviews.length > 0 && <em>★ {averageRating.toFixed(1)} · {reviewsLabel}</em>}
            </div>

            <div className="product-price-row product-price-row--fixed">
              <div className="product-price-main">
                <small>Цена</small>
                <strong>от {money(product.price)} BYN</strong>
              </div>
              {product.oldPrice && product.oldPrice > product.price && <del>{money(product.oldPrice)} BYN</del>}
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

        <article className="product-content-card product-content-card--wide product-reviews-redesign">
          <div className="product-reviews-head product-reviews-head--redesign">
            <div>
              <p className="product-section-eyebrow">Отзывы</p>
              <h2>Отзывы покупателей</h2>
              <span>{reviews.length ? `Средняя оценка ${averageRating.toFixed(1)} из 5 · ${reviewsLabel}` : 'Пока оценок нет'}</span>
            </div>
            <div className="reviews-summary-card">
              <strong>{reviews.length ? averageRating.toFixed(1) : '0.0'}</strong>
              <RatingStars value={roundedRating} readOnly />
              <small>{reviewsLabel}</small>
            </div>
          </div>

          <div className="product-reviews-grid product-reviews-grid--redesign">
            <div className="reviews-list reviews-list--redesign">
              {reviews.length ? reviews.map((review) => (
                <article key={review.id} className="review-card review-card--redesign">
                  <div className="review-card-top">
                    <div>
                      <b>{review.user_name || review.user_email || 'Покупатель'}</b>
                      <small>{review.created_at ? new Date(review.created_at).toLocaleDateString('ru-RU') : 'Отзыв покупателя'}</small>
                    </div>
                    <RatingStars value={review.rating} readOnly size="small" />
                  </div>
                  <p>{review.comment}</p>
                  {!!review.photo_urls?.length && (
                    <div className="review-photos">
                      {review.photo_urls.map((url) => (
                        <button key={url} type="button" onClick={() => setReviewPhotoLightbox(url)} aria-label="Открыть фото отзыва">
                          <img src={url} alt="Фото отзыва" />
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              )) : (
                <div className="empty-reviews empty-reviews--redesign">
                  <b>Отзывов пока нет</b>
                  <span>Когда покупатели оставят отзывы, здесь появится средняя оценка и реальные комментарии. Сейчас рейтинг товара — 0.0.</span>
                </div>
              )}
            </div>

            <form className="review-form review-form--redesign" onSubmit={submitReview}>
              <h3>Оставить отзыв</h3>
              <p>Оцените товар, напишите комментарий и при желании добавьте фото. Отзыв появится сразу.</p>
              <label className="review-stars-field">
                <span>Ваша оценка</span>
                <RatingStars value={reviewRating} onChange={setReviewRating} />
              </label>
              <label>
                <span>Комментарий</span>
                <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} rows={5} placeholder="Расскажите о товаре" required />
              </label>
              <label className="review-photo-field">
                <span>Фото к отзыву</span>
                <input type="file" accept="image/*" multiple onChange={chooseReviewPhotos} />
                <small>{reviewPhotos.length ? `Выбрано фото: ${reviewPhotos.length}` : 'Можно добавить до 5 фото'}</small>
              </label>
              {reviewMessage && <p className="review-message">{reviewMessage}</p>}
              <button type="submit" disabled={reviewSubmitting}>{reviewSubmitting ? 'Публикуем...' : 'Опубликовать отзыв'}</button>
            </form>
          </div>
        </article>
      </section>

      {related.length > 0 && (
        <section className="related-products-section">
          <div className="related-head"><h2>Похожие товары</h2><Link href="/catalog">В каталог</Link></div>
          <div className="related-grid">
            {related.map((item) => {
              const itemImageSettings = getImagePreset(item, item.image, 'related');
              const itemDiscount = discountPercent(item.price, item.oldPrice);

              return (
                <article className="related-card related-card--shop" key={item.slug}>
                  <Link href={`/product/${item.slug}`} className="related-image related-image--shop">
                    <img src={item.image} alt={item.title} style={itemImageSettings.style} />
                    {itemDiscount && <span className="related-sale-badge">-{itemDiscount}%</span>}
                  </Link>
                  <div className="related-card-body">
                    <div className="related-card-meta">
                      <span className={item.inStock ? 'is-available' : 'is-order'}>{item.inStock ? 'В наличии' : 'Под заказ'}</span>
                      {item.category && <small>{item.category}</small>}
                    </div>
                    <Link href={`/product/${item.slug}`} className="related-card-title">{item.title}</Link>
                    <p className="related-card-subtitle">{item.short || item.material}</p>
                    <div className="related-card-tags">
                      {item.material && <span>{item.material}</span>}
                      {item.sizes?.[0] && <span>{item.sizes[0]}</span>}
                    </div>
                    <div className="related-card-bottom">
                      <div className="related-card-price">
                        <b>от {money(item.price)} BYN</b>
                        {item.oldPrice && item.oldPrice > item.price && <del>{money(item.oldPrice)} BYN</del>}
                      </div>
                      <button type="button" aria-label={`Добавить в корзину: ${item.title}`} onClick={() => handleAddRelatedToCart(item)}>
                        <Icon name="cart" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
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
            <form onSubmit={submitQuickOrder}>
              <input name="name" value={quickOrderName} onChange={(event) => setQuickOrderName(event.target.value)} placeholder="Ваше имя" required />
              <input name="phone" value={quickOrderPhone} onChange={(event) => setQuickOrderPhone(event.target.value)} placeholder="Телефон" required />
              <textarea name="comment" value={quickOrderComment} onChange={(event) => setQuickOrderComment(event.target.value)} placeholder="Комментарий к заказу" rows={4} />
              <button type="submit" disabled={quickOrderLoading}>{quickOrderLoading ? 'Отправляем...' : 'Отправить заявку'}</button>
            </form>
          </div>
        </div>
      )}

      {reviewPhotoLightbox && (
        <div className="review-photo-lightbox" role="dialog" aria-modal="true" onClick={() => setReviewPhotoLightbox(null)}>
          <button type="button" onClick={() => setReviewPhotoLightbox(null)} aria-label="Закрыть фото">×</button>
          <img src={reviewPhotoLightbox} alt="Фото из отзыва" onClick={(event) => event.stopPropagation()} />
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
