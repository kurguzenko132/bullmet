'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export type HomeReview = {
  id: string;
  product_slug?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  rating: number;
  comment: string;
  photo_urls?: string[] | null;
  verified_purchase?: boolean;
  created_at?: string | null;
};

function customerName(review: HomeReview) {
  const value = (review.user_name || review.user_email || 'Покупатель').trim();
  const parts = value.split(/\s+/).filter(Boolean);
  return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : value;
}

function formatDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function Stars({ rating }: { rating: number }) {
  return <span className="home-review-stars" aria-label={`Оценка ${rating} из 5`}>{Array.from({ length: 5 }, (_, index) => <span key={index} className={index < Math.round(rating) ? 'is-filled' : ''}>★</span>)}</span>;
}

export function HomeReviewsClient({ eyebrow, title, reviews }: { eyebrow: string; title: string; reviews: HomeReview[] }) {
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);

  return <section className="home-container home-reviews" aria-labelledby="home-reviews-title">
    <header className="home-reviews__head">
      <div><p>{eyebrow}</p><h2 id="home-reviews-title">{title}</h2></div>
    </header>
    <div className="home-reviews__grid">
      {reviews.map((review) => {
        const photos = (review.photo_urls || []).filter(Boolean).slice(0, 3);
        const name = customerName(review);
        return <article className="home-review-card" key={review.id}>
          <header>
            <span className="home-review-avatar">{name[0]?.toUpperCase() || 'П'}</span>
            <div className="home-review-author"><b>{name}</b>{review.verified_purchase && <small>✓ Куплено на Bullmet</small>}</div>
            <Stars rating={review.rating} />
            <time>{formatDate(review.created_at)}</time>
          </header>
          <p className="home-review-card__text">{review.comment}</p>
          {!!photos.length && <div className={`home-review-gallery is-${photos.length}`}>
            {photos.map((photo, index) => <button type="button" key={photo} onClick={() => setLightbox({ photos: review.photo_urls || photos, index })} aria-label={`Открыть фото ${index + 1} из отзыва ${name}`}><img src={photo} alt={`Фото отзыва ${name}`} />{index === 2 && (review.photo_urls?.length || 0) > 3 && <b>+{(review.photo_urls?.length || 0) - 3}</b>}</button>)}
          </div>}
        </article>;
      })}
    </div>
    {lightbox && <div className="home-review-lightbox" role="dialog" aria-modal="true" aria-label="Фотографии отзыва" onClick={() => setLightbox(null)}>
      <button className="home-review-lightbox__close" type="button" onClick={() => setLightbox(null)} aria-label="Закрыть"><X /></button>
      <button type="button" onClick={(event) => { event.stopPropagation(); setLightbox((current) => current ? { ...current, index: (current.index - 1 + current.photos.length) % current.photos.length } : current); }} aria-label="Предыдущее фото"><ChevronLeft /></button>
      <img src={lightbox.photos[lightbox.index]} alt="Фотография из отзыва" onClick={(event) => event.stopPropagation()} />
      <button type="button" onClick={(event) => { event.stopPropagation(); setLightbox((current) => current ? { ...current, index: (current.index + 1) % current.photos.length } : current); }} aria-label="Следующее фото"><ChevronRight /></button>
    </div>}
  </section>;
}
